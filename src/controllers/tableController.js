
const prisma = require('../config/prisma');

// Отримати всі столики
const getAllTables = async (req, res, next) => {
  try {
    const tables = await prisma.restaurantTable.findMany({
      orderBy: { number: 'asc' }
    });

    res.status(200).json(tables);
  } catch (error) {
    next(error);
  }
};

// Отримати столик за ID
const getTableById = async (req, res, next) => {
  try {
    const table = await prisma.restaurantTable.findUnique({
      where: { id: req.params.id }
    });

    if (!table) {
      return res.status(404).json({
        message: 'Table not found'
      });
    }

    res.status(200).json(table);
  } catch (error) {
    next(error);
  }
};

// Створити столик
const createTable = async (req, res, next) => {
  try {
    const { restaurantId, number, capacity, isActive } = req.body;

    const table = await prisma.restaurantTable.create({
      data: {
        restaurantId,
        number,
        capacity,
        isActive
      }
    });

    res.status(201).json(table);
  } catch (error) {
    next(error);
  }
};

// Оновити столик
const updateTable = async (req, res, next) => {
  try {
    const table = await prisma.restaurantTable.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.status(200).json(table);
  } catch (error) {
    next(error);
  }
};

// Видалити столик
const deleteTable = async (req, res, next) => {
  try {
    await prisma.restaurantTable.delete({
      where: { id: req.params.id }
    });

    res.status(200).json({
      message: 'Table deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable
};
