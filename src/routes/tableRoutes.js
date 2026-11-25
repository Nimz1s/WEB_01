
const express = require('express');
const router = express.Router();

const validate = require('../middleware/validate');

const {
  createTableSchema,
  updateTableSchema
} = require('../validators/tableValidator');

const {
  getAllTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable
} = require('../controllers/tableController');

/**
 * @swagger
 * tags:
 *   name: Tables
 *   description: Restaurant table management
 */

/**
 * @swagger
 * /api/tables:
 *   get:
 *     summary: Get all tables
 *     tags: [Tables]
 *     responses:
 *       200:
 *         description: List of tables
 */
router.get('/', getAllTables);

/**
 * @swagger
 * /api/tables/{id}:
 *   get:
 *     summary: Get table by ID
 *     tags: [Tables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Table found
 *       404:
 *         description: Table not found
 */
router.get('/:id', getTableById);

/**
 * @swagger
 * /api/tables:
 *   post:
 *     summary: Create a table
 *     tags: [Tables]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *               - number
 *               - capacity
 *             properties:
 *               restaurantId:
 *                 type: string
 *                 format: uuid
 *                 example: d1253558-bf3c-4486-966b-93ab5193594b
 *               number:
 *                 type: integer
 *                 example: 1
 *               capacity:
 *                 type: integer
 *                 example: 4
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Table created
 *       400:
 *         description: Validation error
 */
router.post('/', validate(createTableSchema), createTable);

/**
 * @swagger
 * /api/tables/{id}:
 *   put:
 *     summary: Update table
 *     tags: [Tables]
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
 *               number:
 *                 type: integer
 *               capacity:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Table updated
 *       404:
 *         description: Table not found
 */
router.put('/:id', validate(updateTableSchema), updateTable);

/**
 * @swagger
 * /api/tables/{id}:
 *   delete:
 *     summary: Delete table
 *     tags: [Tables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Table deleted
 *       404:
 *         description: Table not found
 */
router.delete('/:id', deleteTable);

module.exports = router;
