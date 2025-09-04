const progressService = require('../services/progress.service');

class ProgressController {
  async getOverview(req, res, next) {
    try {
      const userId = req.userId;
      
      const overview = await progressService.getOverallProgress(userId);
      
      res.json({
        success: true,
        data: overview
      });
    } catch (error) {
      next(error);
    }
  }

  async getSubjects(req, res, next) {
    try {
      const userId = req.userId;
      const subjectId = req.query.subject_id;
      
      const progress = await progressService.getSubjectProgress(userId, subjectId);
      
      res.json({
        success: true,
        data: progress
      });
    } catch (error) {
      next(error);
    }
  }

  async getStreaks(req, res, next) {
    try {
      const userId = req.userId;
      
      const streak = await progressService.updateStreak(userId);
      
      res.json({
        success: true,
        data: {
          currentStreak: streak
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req, res, next) {
    try {
      const userId = req.userId;
      const period = req.query.period || '30';
      
      const analytics = await progressService.getAnalytics(userId, period);
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProgressController();