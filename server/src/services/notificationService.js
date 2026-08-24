const Notification = require('../models/Notification');

class NotificationService {
  async listNotifications(userId, limit = 30) {
    const notifications = await Notification.find({ owner: userId })
      .populate('workflow', 'name')
      .sort({ createdAt: -1 })
      .limit(limit);

    const unreadCount = await Notification.countDocuments({ owner: userId, isRead: false });

    return {
      notifications,
      unreadCount
    };
  }

  async markAsRead(userId, notificationId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, owner: userId },
      { isRead: true },
      { new: true }
    );
    return notification;
  }

  async markAllAsRead(userId) {
    await Notification.updateMany({ owner: userId, isRead: false }, { isRead: true });
    return { success: true };
  }
}

module.exports = new NotificationService();
