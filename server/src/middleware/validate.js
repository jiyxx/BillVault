/**
 * Generic validation middleware factory.
 * Pass a Joi schema; it validates req.body and passes errors to error handler.
 */
const validate = (schema) => {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      error.isJoi = true;
      return next(error);
    }

    req.body = value;
    next();
  };
};

/**
 * Validate query parameters.
 */
const validateQuery = (schema) => {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      error.isJoi = true;
      return next(error);
    }

    req.query = value;
    next();
  };
};

module.exports = { validate, validateQuery };
