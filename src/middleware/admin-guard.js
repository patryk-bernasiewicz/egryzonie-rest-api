module.exports = (req, res, next) => {
  if (!req.user || !['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(401).json({ message: 'unauthorized' });
  }
  return next();
};
