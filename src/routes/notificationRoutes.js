
const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/auth');

const {
  getMyNotifications,
  markNotificationAsRead
} = require('../controllers/notificationController');

// Отримати власні сповіщення
/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get current user's notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateToken, getMyNotifications);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 *       401:
 *         description: Unauthorized
 */
// Позначити сповіщення як прочитане
router.patch('/:id/read', authenticateToken, markNotificationAsRead);

module.exports = router;
