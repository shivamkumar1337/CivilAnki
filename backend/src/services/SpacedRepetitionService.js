// services/spacedRepetitionService.js
class SpacedRepetitionService {
  constructor() {
    // Default Anki settings
    this.defaultSettings = {
      learningSteps: [1, 10], // minutes
      graduatingInterval: 1, // days
      easyInterval: 4, // days
      startingEase: 2.5,
      easyBonus: 1.3,
      intervalModifier: 1.0,
      hardInterval: 1.2,
      newInterval: 0.0,
      minimumInterval: 1,
      leechThreshold: 8
    };
  }

  // Calculate next review based on quality (0-5)
  calculateNextReview(currentProgress, quality, settings = this.defaultSettings) {
    const now = new Date();
    let nextReview = new Date(now);
    let newProgress = { ...currentProgress };

    // Quality mapping: 0=Again, 1=Hard, 2=Good, 3=Easy
    // Extended: 4=Very Easy, 5=Perfect
    
    if (currentProgress.card_type === 'learning' || !currentProgress.card_type) {
      return this.handleLearningCard(newProgress, quality, settings, now);
    } else if (currentProgress.card_type === 'review') {
      return this.handleReviewCard(newProgress, quality, settings, now);
    } else if (currentProgress.card_type === 'relearning') {
      return this.handleRelearningCard(newProgress, quality, settings, now);
    }

    return newProgress;
  }

  handleLearningCard(progress, quality, settings, now) {
    const stepIndex = progress.step_index || 0;
    const learningSteps = settings.learningSteps;

    if (quality < 2) { // Again
      // Reset to first step
      progress.step_index = 0;
      progress.next_review_at = new Date(now.getTime() + learningSteps[0] * 60000);
    } else if (quality === 2) { // Good
      if (stepIndex < learningSteps.length - 1) {
        // Move to next learning step
        progress.step_index = stepIndex + 1;
        progress.next_review_at = new Date(now.getTime() + learningSteps[stepIndex + 1] * 60000);
      } else {
        // Graduate to review
        progress.card_type = 'review';
        progress.interval_days = settings.graduatingInterval;
        progress.repetitions = 1;
        progress.ease_factor = settings.startingEase;
        progress.graduated_at = now;
        progress.next_review_at = new Date(now.getTime() + settings.graduatingInterval * 24 * 60 * 60 * 1000);
      }
    } else if (quality >= 3) { // Easy
      // Graduate immediately with easy interval
      progress.card_type = 'review';
      progress.interval_days = settings.easyInterval;
      progress.repetitions = 1;
      progress.ease_factor = settings.startingEase;
      progress.graduated_at = now;
      progress.next_review_at = new Date(now.getTime() + settings.easyInterval * 24 * 60 * 60 * 1000);
    }

    progress.attempts = (progress.attempts || 0) + 1;
    progress.last_attempt_at = now;
    progress.quality = quality;

    return progress;
  }

  handleReviewCard(progress, quality, settings, now) {
    const currentInterval = progress.interval_days || 1;
    const currentEase = progress.ease_factor || settings.startingEase;
    const repetitions = progress.repetitions || 0;

    if (quality < 2) { // Again - card lapses
      progress.lapses = (progress.lapses || 0) + 1;
      progress.card_type = 'relearning';
      progress.step_index = 0;
      progress.next_review_at = new Date(now.getTime() + settings.learningSteps[0] * 60000);
      
      // Reduce interval for when it graduates again
      progress.interval_days = Math.max(
        Math.round(currentInterval * settings.newInterval),
        settings.minimumInterval
      );
    } else {
      // Calculate new ease factor
      let newEase = currentEase;
      if (quality === 1) { // Hard
        newEase = Math.max(1.3, currentEase - 0.15);
        progress.interval_days = Math.max(
          Math.round(currentInterval * settings.hardInterval),
          settings.minimumInterval
        );
      } else if (quality === 2) { // Good
        newEase = currentEase;
        progress.interval_days = Math.round(currentInterval * newEase * settings.intervalModifier);
      } else { // Easy (3+)
        newEase = currentEase + 0.15;
        progress.interval_days = Math.round(
          currentInterval * newEase * settings.intervalModifier * settings.easyBonus
        );
      }

      progress.ease_factor = newEase;
      progress.repetitions = repetitions + 1;
      progress.next_review_at = new Date(now.getTime() + progress.interval_days * 24 * 60 * 60 * 1000);
    }

    progress.attempts = (progress.attempts || 0) + 1;
    progress.last_attempt_at = now;
    progress.quality = quality;

    return progress;
  }

  handleRelearningCard(progress, quality, settings, now) {
    const stepIndex = progress.step_index || 0;
    const learningSteps = settings.learningSteps;

    if (quality < 2) { // Again
      progress.step_index = 0;
      progress.next_review_at = new Date(now.getTime() + learningSteps[0] * 60000);
    } else if (quality === 2) { // Good
      if (stepIndex < learningSteps.length - 1) {
        progress.step_index = stepIndex + 1;
        progress.next_review_at = new Date(now.getTime() + learningSteps[stepIndex + 1] * 60000);
      } else {
        // Graduate back to review with previous interval
        progress.card_type = 'review';
        progress.next_review_at = new Date(now.getTime() + (progress.interval_days || 1) * 24 * 60 * 60 * 1000);
      }
    } else { // Easy
      // Graduate immediately
      progress.card_type = 'review';
      progress.next_review_at = new Date(now.getTime() + (progress.interval_days || 1) * 24 * 60 * 60 * 1000);
    }

    progress.attempts = (progress.attempts || 0) + 1;
    progress.last_attempt_at = now;
    progress.quality = quality;

    return progress;
  }

  // Get user's spaced repetition settings
  async getUserSettings(supabase, userId) {
    const { data, error } = await supabase
      .from('spaced_repetition_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return this.defaultSettings;
    }

    return {
      learningSteps: data.learning_steps,
      graduatingInterval: data.graduating_interval,
      easyInterval: data.easy_interval,
      startingEase: data.starting_ease,
      easyBonus: data.easy_bonus,
      intervalModifier: data.interval_modifier,
      hardInterval: data.hard_interval,
      newInterval: data.new_interval,
      minimumInterval: data.minimum_interval,
      leechThreshold: data.leech_threshold
    };
  }

  // Check if card is a leech (failed too many times)
  isLeech(progress, settings = this.defaultSettings) {
    return (progress.lapses || 0) >= settings.leechThreshold;
  }
}

module.exports = new SpacedRepetitionService();