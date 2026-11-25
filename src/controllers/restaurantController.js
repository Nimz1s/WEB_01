
const prisma = require('../config/prisma');

// GET /api/restaurants
// Отримати всі ресторани
const getAllRestaurants = async (req, res, next) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json(restaurants);
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
        imageUrl
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
