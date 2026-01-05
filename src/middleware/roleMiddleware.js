
const supabase = require('../config/supabase');

/**
 * Middleware to check if user has one of the allowed roles
 * @param {string[]} allowedRoles 
 */
const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Fetch user's role from public.users table or public.roles
      // Assuming public.users has a role_id, and we need to check the role name
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          roles (
            name
          )
        `)
        .eq('id', req.user.id)
        .single();

      if (userError || !userData) {
        return res.status(403).json({ error: 'User profile not found' });
      }

      const userRole = userData.roles?.name;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ error: `Access denied. Required role: ${allowedRoles.join(' or ')}` });
      }

      req.userData = userData; // Attach full user profile to request
      next();
    } catch (err) {
      console.error('Role Middleware Error:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
};

module.exports = requireRole;
