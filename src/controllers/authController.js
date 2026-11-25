
const prisma = require('../config/prisma');
const {
  hashPassword,
  verifyPassword
} = require('../utils/password');

const {
  generateAccessToken
} = require('../utils/jwt');

const {
  generateRefreshToken,
  hashRefreshToken
} = require('../utils/refreshToken');

const jwt = require('jsonwebtoken');

// POST /api/auth/register
// Реєстрація користувача
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'Користувач із таким email вже існує'
      });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json({
      message: 'Користувача успішно зареєстровано',
      user
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/login
// Вхід користувача
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        message: 'Неправильний email або пароль'
      });
    }

    const isPasswordValid = await verifyPassword(
      password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Неправильний email або пароль'
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await prisma.refreshToken.create({
      data: {
        tokenHash: hashRefreshToken(refreshToken),
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    res.json({
      message: 'Вхід успішний',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/refresh
// Оновлення Access Token

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: 'Refresh Token обов’язковий'
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const tokenHash = hashRefreshToken(refreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash }
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res.status(401).json({
        message: 'Refresh Token недійсний або прострочений'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(401).json({
        message: 'Користувача не знайдено'
      });
    }

    const newRefreshToken = generateRefreshToken(user);
    const newAccessToken = generateAccessToken(user);

    await prisma.$transaction([
      prisma.refreshToken.delete({
        where: { tokenHash }
      }),
      prisma.refreshToken.create({
        data: {
          tokenHash: hashRefreshToken(newRefreshToken),
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      })
    ]);

    res.json({
      message: 'Токени успішно оновлено',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      return res.status(401).json({
        message: 'Refresh Token недійсний або прострочений'
      });
    }

    next(error);
  }
}


// POST /api/auth/logout
// Вихід користувача
async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: 'Refresh Token обов’язковий'
      });
    }

    const tokenHash = hashRefreshToken(refreshToken);

    await prisma.refreshToken.deleteMany({
      where: { tokenHash }
    });

    res.json({
      message: 'Вихід успішний'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout
};
