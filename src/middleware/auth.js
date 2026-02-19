// src/middleware/auth.js
export function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/admin/login');
}
