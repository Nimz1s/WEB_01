
const { z } = require('zod');

const createRestaurantSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Name must contain at least 2 characters')
    .max(100),

  description: z.string().trim().max(1000).optional(),

  address: z.string()
    .trim()
    .min(5, 'Address must contain at least 5 characters'),

  phone: z.string().trim().max(30).optional(),

  imageUrl: z.string().url('Invalid image URL').optional()
});

const updateRestaurantSchema = createRestaurantSchema
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided'
  });

module.exports = {
  createRestaurantSchema,
  updateRestaurantSchema
};
