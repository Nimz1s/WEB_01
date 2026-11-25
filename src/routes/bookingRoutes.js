
const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

const {
  createBooking,
  getMyBookings,
  getRestaurantBookings,
  updateBookingStatus
} = require('../controllers/bookingController');

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management
 */

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tableId
 *               - startsAt
 *               - endsAt
 *               - guests
 *             properties:
 *               tableId:
 *                 type: string
 *                 format: uuid
 *               startsAt:
 *                 type: string
 *                 format: date-time
 *               endsAt:
 *                 type: string
 *                 format: date-time
 *               guests:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Booking created
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Table already booked
 */
router.post(
  '/',
  authenticateToken,
  authorizeRoles('CUSTOMER'),
  createBooking
);

/**
 * @swagger
 * /api/bookings/my:
 *   get:
 *     summary: Get current user's bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's bookings
 */
router.get(
  '/my',
  authenticateToken,
  getMyBookings
);

/**
 * @swagger
 * /api/bookings/restaurant/{restaurantId}:
 *   get:
 *     summary: Get restaurant bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of restaurant bookings
 *       403:
 *         description: Access denied
 */
router.get(
  '/restaurant/:restaurantId',
  authenticateToken,
  authorizeRoles('RESTAURANT_ADMIN'),
  getRestaurantBookings
);

/**
 * @swagger
 * /api/bookings/{id}/status:
 *   patch:
 *     summary: Update booking status
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [CONFIRMED, CANCELLED, COMPLETED]
 *     responses:
 *       200:
 *         description: Booking status updated
 *       403:
 *         description: Access denied
 */
router.patch(
  '/:id/status',
  authenticateToken,
  authorizeRoles('RESTAURANT_ADMIN'),
  updateBookingStatus
);

module.exports = router;
