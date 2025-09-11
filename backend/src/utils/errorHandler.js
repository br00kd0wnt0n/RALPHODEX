const errorHandler = (error, req, res, next) => {
  console.error('Error:', error);
  
  if (error.name === 'SequelizeValidationError') {
    const errors = error.errors.map(err => ({
      field: err.path,
      message: err.message
    }));
    
    return res.status(400).json({
      error: 'Validation Error',
      details: errors
    });
  }
  
  if (error.name === 'SequelizeUniqueConstraintError') {
    const field = error.errors[0]?.path || 'unknown';
    return res.status(409).json({
      error: 'Duplicate Entry',
      message: `${field} already exists`
    });
  }
  
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      error: 'Invalid Reference',
      message: 'Referenced record does not exist'
    });
  }
  
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Authentication Error',
      message: 'Invalid token'
    });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Authentication Error',
      message: 'Token expired'
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
};

module.exports = errorHandler;