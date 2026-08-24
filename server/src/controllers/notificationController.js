const notificationService = require('../services/notificationService');

class NotificationController {
  async list(req, res, next) {
    try {
      const result = await notificationService.listNotifications(req.user._id);
      res.status(200).json({
        success: true,
        data: result.notifications,
        unreadCount: result.unreadCount
      });
    } catch (err) {
      next(err);
    }
  }

  async markRead(req, res, next) {
    try {
      const notification = await notificationService.markAsRead(req.user._id, req.params.id);
      res.status(200).json({
        success: true,
        data: notification
      });
    } catch (err) {
      next(err);
    }
  }

  async markAllRead(req, res, next) {
    try {
      await notificationService.markAllAsRead(req.user._id);
      res.status(200).json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationController();
