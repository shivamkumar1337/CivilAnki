const moment = require('moment');

class Helpers {
  static formatDate(date) {
    return moment(date).format('YYYY-MM-DD');
  }

  static formatDateTime(date) {
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
  }

  static calculateAccuracy(correct, total) {
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  }

  static formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  static validateUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  static sanitizeString(str) {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/\s+/g, ' ');
  }

  static generateSessionSummary(reviews) {
    const total = reviews.length;
    const correct = reviews.filter(r => r.is_correct).length;
    const accuracy = this.calculateAccuracy(correct, total);
    
    const totalTime = reviews.reduce((sum, r) => sum + (r.response_time_seconds || 0), 0);
    const averageTime = total > 0 ? totalTime / total : 0;

    const subjectBreakdown = reviews.reduce((acc, review) => {
      const subject = review.subject_name;
      if (!acc[subject]) {
        acc[subject] = { total: 0, correct: 0 };
      }
      acc[subject].total++;
      if (review.is_correct) acc[subject].correct++;
      return acc;
    }, {});

    return {
      totalQuestions: total,
      correctAnswers: correct,
      incorrectAnswers: total - correct,
      accuracy,
      averageTime: Math.round(averageTime),
      totalTime: Math.round(totalTime),
      subjectBreakdown
    };
  }
}

module.exports = Helpers;