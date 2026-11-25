
const prisma = require('../config/prisma');
const { getIO } = require('../socket');

// Create booking
async function createBooking(req, res, next) {
  try {
    const { tableId, startsAt, endsAt, guests } = req.body;

    if (!tableId || !startsAt || !endsAt || !Number.isInteger(guests) || guests < 1) {
      return res.status(400).json({
        message: 'Invalid booking data'
      });
    }

    const start = new Date(startsAt);
    const end = new Date(endsAt);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      start <= new Date() ||
      end <= start
    ) {
      return res.status(400).json({
        message: 'Invalid booking time'
      });
    }

    const table = await prisma.restaurantTable.findUnique({
      where: { id: tableId }
    });

    if (!table || !table.isActive) {
      return res.status(404).json({
        message: 'Table not found or inactive'
      });
    }

    if (guests > table.capacity) {
      return res.status(400).json({
        message: 'Number of guests exceeds table capacity'
      });
    }

    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        tableId,
        status: {
          not: 'CANCELLED'
        },
        startsAt: {
          lt: end
        },
        endsAt: {
          gt: start
        }
      }
    });

    if (conflictingBooking) {
      return res.status(409).json({
        message: 'Table is already booked for this time'
      });
    }

    const booking = await prisma.booking.create({
      data: {
        userId: req.user.id,
        tableId,
        startsAt: start,
        endsAt: end,
        guests
      },
      include: {
        table: {
          include: {
            restaurant: true
          }
        }
      }
    });

    getIO()
        .to(`restaurant:${booking.table.restaurantId}`)
        .emit('booking:new', {
            id: booking.id,
            userId: booking.userId,
            tableId: booking.tableId,
            startsAt: booking.startsAt,
            endsAt: booking.endsAt,
            guests: booking.guests,
            status: booking.status
        });

    return res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    next(error);
  }
}

// Get current user's bookings
async function getMyBookings(req, res, next) {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        table: {
          include: {
            restaurant: true
          }
        }
      },
      orderBy: {
        startsAt: 'desc'
      }
    });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
}

// Get bookings for restaurant owned by current admin
async function getRestaurantBookings(req, res, next) {
  try {
    const { restaurantId } = req.params;

    const restaurant = await prisma.restaurant.findFirst({
      where: {
        id: restaurantId,
        ownerId: req.user.id
      }
    });

    if (!restaurant) {
      return res.status(404).json({
        message: 'Restaurant not found or access denied'
      });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        table: {
          restaurantId
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        table: true
      },
      orderBy: {
        startsAt: 'asc'
      }
    });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
}

// Update booking status
async function updateBookingStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['CONFIRMED', 'CANCELLED', 'COMPLETED'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid booking status'
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        table: {
          include: {
            restaurant: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found'
      });
    }

    if (booking.table.restaurant.ownerId !== req.user.id) {
      return res.status(403).json({
        message: 'You cannot manage this booking'
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        table: {
          include: {
            restaurant: true
          }
        }
      }
    });


    const notification = await prisma.notification.create({
    data: {
        userId: updatedBooking.userId,
        type: 'BOOKING_STATUS',
        message: `Your booking at ${updatedBooking.table.restaurant.name} has been ${status.toLowerCase()}.`
    }
    });

    getIO()
        .to(`user:${updatedBooking.userId}`)
        .emit('notification:new', notification);


    getIO()
        .to(`user:${updatedBooking.userId}`)
        .emit('booking:updated', {
            id: updatedBooking.id,
            status: updatedBooking.status,
            startsAt: updatedBooking.startsAt,
            endsAt: updatedBooking.endsAt
        });

    res.json({
      message: 'Booking status updated successfully',
      booking: updatedBooking
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createBooking,
  getMyBookings,
  getRestaurantBookings,
  updateBookingStatus
};
