
const { z } = require('zod');

const createTableSchema = z.object({
  restaurantId: z.string().uuid('Invalid restaurant ID'),

  number: z.number()
    .int('Table number must be an integer')
    .positive('Table number must be positive'),

  capacity: z.number()
    .int('Capacity must be an integer')
    .min(1, 'Capacity must be at least 1'),

  isActive: z.boolean().optional()
});

const updateTableSchema = z.object({
  number: z.number()
    .int()
    .positive()
    .optional(),

  capacity: z.number()
    .int()
    .min(1)
    .optional(),

  isActive: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided'
});

module.exports = {
  createTableSchema,
  updateTableSchema
};
