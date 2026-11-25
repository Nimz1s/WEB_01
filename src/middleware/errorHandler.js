const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.code === 'P2002') {
    return res.status(409).json({
      message: 'A record with this unique value already exists'
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      message: 'Record not found'
    });
  }

  if (err.code === 'P2003') {
    return res.status(400).json({
      message: 'Related record does not exist'
    });
  }

  res.status(err.status || 500).json({
    message: err.status ? err.message : 'Internal server error'
  });
};

module.exports = errorHandler;