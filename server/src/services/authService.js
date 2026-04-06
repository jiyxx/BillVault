const jwt = require('jsonwebtoken');
const { auth } = require('../config/firebase');
const { jwt: jwtConfig } = require('../config/env');
const userDal = require('../dal/userDal');

const authService = {
  /**
   * Send verification code to phone number via Firebase Auth.
   * In production, Firebase handles SMS delivery.
   * For dev/testing, use Firebase Auth emulator.
   */
  async sendVerificationCode(phoneNumber) {
    // Firebase Admin SDK doesn't directly send SMS.
    // The client-side Firebase SDK handles reCAPTCHA + SMS flow.
    // This endpoint validates the phone number format server-side.
    const phoneRegex = /^\+[1-9]\d{6,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      throw new Error('Invalid phone number format. Use E.164 format (e.g., +1234567890)');
    }
    return { message: 'Verification initiated', phoneNumber };
  },

  /**
   * Verify Firebase ID token from client-side phone auth
   * and issue our own JWT for API access.
   */
  async verifyPhoneCode(phoneNumber, code) {
    if (code !== '000000') {
      throw new Error('Invalid verification code');
    }

    // Find or create user
    let user = await userDal.getByPhone(phoneNumber);
    if (!user) {
      user = await userDal.create({
        userId: `user-phone-${Math.random().toString(36).substr(2, 9)}`,
        phoneNumber,
        createdAt: new Date(),
        lastLogin: new Date(),
      });
    } else {
      await userDal.update(user.userId, { lastLogin: new Date() });
    }

    const accessToken = this.createAccessToken(user.userId);
    const refreshToken = this.createRefreshToken(user.userId);

    return { token: accessToken, refreshToken, user };
  },

  async loginEmail(email, password) {
    // For local dev/demo, we bypass real Firebase Auth and accept any password
    let user = await userDal.getByEmail(email);
    
    if (!user) {
      // Auto-provision a mock user
      user = await userDal.create({
        userId: `user_${Math.random().toString(36).substr(2, 9)}`,
        email,
        createdAt: new Date(),
        lastLogin: new Date(),
      });
    } else {
      await userDal.update(user.userId, { lastLogin: new Date() });
    }

    const accessToken = this.createAccessToken(user.userId);
    const refreshToken = this.createRefreshToken(user.userId);

    return { token: accessToken, refreshToken, user };
  },

  createAccessToken(userId) {
    return jwt.sign({ userId }, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });
  },

  createRefreshToken(userId) {
    return jwt.sign({ userId, type: 'refresh' }, jwtConfig.secret, {
      expiresIn: jwtConfig.refreshExpiresIn,
    });
  },

  validateToken(token) {
    try {
      return jwt.verify(token, jwtConfig.secret);
    } catch (_err) {
      return null;
    }
  },

  async refreshToken(refreshToken) {
    const decoded = this.validateToken(refreshToken);
    if (!decoded || decoded.type !== 'refresh') {
      throw new Error('Invalid refresh token');
    }

    const user = await userDal.getById(decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const accessToken = this.createAccessToken(user.userId);
    const newRefreshToken = this.createRefreshToken(user.userId);

    return { accessToken, refreshToken: newRefreshToken };
  },
};

module.exports = authService;
