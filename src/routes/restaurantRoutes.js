
const express = require('express');
const router = express.Router();

const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const prisma = require('../config/prisma');
const { deleteFile } = require('../services/fileService');

const {
  createRestaurantSchema,
  updateRestaurantSchema
} = require('../validators/restaurantValidator');

const {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
} = require('../controllers/restaurantController');

/**
 * @swagger
 * tags:
 *   name: Restaurants
 *   description: Restaurant management
 */


/**
 * @swagger
 * /api/restaurants:
 *   get:
 *     summary: Get all restaurants with search, filters and pagination
 *     tags: [Restaurants]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search restaurants by name
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter restaurants by city
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Number of restaurants per page
 *     responses:
 *       200:
 *         description: List of restaurants with pagination
 */

router.get('/', getAllRestaurants);

/**
 * @swagger
 * /api/restaurants/{id}:
 *   get:
 *     summary: Get restaurant by ID
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Restaurant found
 *       404:
 *         description: Restaurant not found
 */
router.get('/:id', getRestaurantById);

/**
 * @swagger
 * /api/restaurants:
 *   post:
 *     summary: Create a restaurant
 *     tags: [Restaurants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *                 example: Bella Italia
 *               description:
 *                 type: string
 *                 example: Italian restaurant
 *               address:
 *                 type: string
 *                 example: Khreshchatyk Street 10, Kyiv
 *               phone:
 *                 type: string
 *                 example: "+380501234567"
 *               imageUrl:
 *                 type: string
 *                 example: https://example.com/image.jpg
 *     responses:
 *       201:
 *         description: Restaurant created
 *       400:
 *         description: Validation error
 */
router.post('/', validate(createRestaurantSchema), createRestaurant);

/**
 * @swagger
 * /api/restaurants/{id}:
 *   put:
 *     summary: Update restaurant
 *     tags: [Restaurants]
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Restaurant updated
 *       404:
 *         description: Restaurant not found
 */
router.put('/:id', validate(updateRestaurantSchema), updateRestaurant);

/**
 * @swagger
 * /api/restaurants/{id}:
 *   delete:
 *     summary: Delete restaurant
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Restaurant deleted
 *       404:
 *         description: Restaurant not found
 */
router.delete('/:id', deleteRestaurant);

// POST /api/restaurants/:id/image
// Завантажити зображення ресторану

/**
 * @swagger
 * /api/restaurants/{id}/image:
 *   post:
 *     summary: Upload restaurant image
 *     tags: [Restaurants]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: Invalid file or missing image
 *       404:
 *         description: Restaurant not found
 */
router.post('/:id/image', (req, res, next) => {
  upload.single('image')(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        message: error.message || 'Помилка завантаження файлу'
      });
    }
    next();
  });
}, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        message: 'Будь ласка, виберіть зображення'
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: { imageUrl }
    });

    res.status(200).json({
      message: 'Зображення ресторану успішно завантажено',
      imageUrl,
      restaurant
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/restaurants/{id}/image:
 *   delete:
 *     summary: Delete restaurant image
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       404:
 *         description: Restaurant or image not found
 */
router.delete('/:id/image', async (req, res, next) => {
  try {
    const { id } = req.params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id }
    });

    if (!restaurant) {
      return res.status(404).json({
        message: 'Ресторан не знайдено'
      });
    }

    if (!restaurant.imageUrl) {
      return res.status(404).json({
        message: 'У ресторану немає зображення'
      });
    }

    deleteFile(restaurant.imageUrl);

    await prisma.restaurant.update({
      where: { id },
      data: { imageUrl: null }
    });

    res.status(200).json({
      message: 'Зображення ресторану успішно видалено'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
