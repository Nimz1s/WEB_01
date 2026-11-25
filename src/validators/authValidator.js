const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Ім’я має містити мінімум 2 символи').max(100),
  email: z.string().trim().email('Некоректний email'),
  password: z.string().min(8, 'Пароль має містити мінімум 8 символів').max(128),
});

const loginSchema = z.object({
  email: z.string().trim().email('Некоректний email'),
  password: z.string().min(1, 'Введіть пароль'),
});

module.exports = {
  registerSchema,
  loginSchema,
};