const express = require('express');
const Joi = require('joi');
const authService = require('../services/authService');
const { validate } = require('../middleware/validate');

const router = express.Router();

const sendCodeSchema = Joi.object({
  phoneNumber: Joi.string().pattern(/^\+[1-9]\d{6,14}$/).required()
    .messages({ 'string.pattern.base': 'Phone number must be in E.164 format (e.g., +1234567890)' }),
});

const verifyCodeSchema = Joi.object({
  phoneNumber: Joi.string().required(),
  code: Joi.string().required(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

// POST /api/auth/send-code
router.post('/send-code', validate(sendCodeSchema), async (req, res, next) => {
  try {
    const result = await authService.sendVerificationCode(req.body.phoneNumber);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/verify-code
router.post('/verify-code', validate(verifyCodeSchema), async (req, res, next) => {
  try {
    const result = await authService.verifyPhoneCode(req.body.phoneNumber, req.body.code);
    res.json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/refresh-token
router.post('/refresh-token', validate(refreshSchema), async (req, res, next) => {
  try {
    const tokens = await authService.refreshToken(req.body.refreshToken);
    res.json(tokens);
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login-email
// Simple mock email login for the demo
router.post('/login-email', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Email and password required' });
    }
    const result = await authService.loginEmail(email, password);
    res.json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
