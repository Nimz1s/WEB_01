
const prisma = require('../config/prisma');

// GET /api/restaurants
// Отримати всі ресторани
const getAllRestaurants = async (req, res, next) => {
  try {
    const {
      search,
      city,
      page = 1,
      limit = 10
    } = req.query;

    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(
      Math.max(parseInt(limit, 10) || 10, 1),
      100
    );

    const skip = (currentPage - 1) * pageSize;

    const where = {
      AND: [
        search
          ? {
              name: {
                contains: search,
                mode: 'insensitive'
              }
            }
          : {},
        city
          ? {
              address: {
                contains: city,
                mode: 'insensitive'
              }
            }
          : {}
      ]
    };

    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: pageSize
      }),
      prisma.restaurant.count({ where })
    ]);

    res.status(200).json({
      data: restaurants,
      pagination: {
        total,
        page: currentPage,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/restaurants/:id
// Отримати ресторан за ID
const getRestaurantById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id }
    });

    if (!restaurant) {
      return res.status(404).json({
        message: 'Restaurant not found'
      });
    }

    res.status(200).json(restaurant);
  } catch (error) {
    next(error);
  }
};

// POST /api/restaurants
// Створити ресторан
const createRestaurant = async (req, res, next) => {
  try {
    const {
      name,
      description,
      address,
      phone,
      imageUrl
    } = req.body;

    const restaurant = await prisma.restaurant.create({
      data: {
      name,
      description,
      address,
      phone,
      imageUrl,
      ownerId: req.user.id
    }
    });

    res.status(201).json(restaurant);
  } catch (error) {
    next(error);
  }
};

// PUT /api/restaurants/:id
// Оновити ресторан
const updateRestaurant = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingRestaurant = await prisma.restaurant.findFirst({
      where: {
        id,
        ownerId: req.user.id
      }
    });

    if (!existingRestaurant) {
      return res.status(404).json({
        message: 'Restaurant not found or access denied'
      });
    }

    const {
      name,
      description,
      address,
      phone,
      imageUrl
    } = req.body;

    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: {
        name,
        description,
        address,
        phone,
        imageUrl
      }
    });

    res.status(200).json(restaurant);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/restaurants/:id
// Видалити ресторан
const deleteRestaurant = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingRestaurant = await prisma.restaurant.findFirst({
      where: {
        id,
        ownerId: req.user.id
      }
    });

    if (!existingRestaurant) {
      return res.status(404).json({
        message: 'Restaurant not found or access denied'
      });
    }

    await prisma.restaurant.delete({
      where: { id }
    });

    res.status(200).json({
      message: 'Restaurant deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
};
