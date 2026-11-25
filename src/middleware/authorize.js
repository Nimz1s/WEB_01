function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Недостатньо прав доступу',
      });
    }

    next();
  };
}

module.exports = {
  authorizeRoles,
};