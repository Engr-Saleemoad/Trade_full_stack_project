/**
 * Middleware to enforce Role-Based Access Control (RBAC) on sub-admins.
 * Master Admin (role === 'admin' or 'master-admin') bypasses all permission checks.
 * Sub-Admins must have explicit module permission (e.g. permissions.deposits.update === true).
 */
export const checkPermission = (moduleName, action = 'read') => {
  return (req, res, next) => {
    // If master admin session, allow access
    if (req.admin && (req.admin.role === 'admin' || req.admin.role === 'master-admin' || !req.admin.role)) {
      return next();
    }

    if (req.admin && req.admin.role === 'sub-admin') {
      const userPermissions = req.admin.permissions || {};
      const moduleRights = userPermissions[moduleName];

      if (moduleRights && moduleRights[action] === true) {
        return next();
      }

      return res.status(403).json({
        success: false,
        error: `Access Denied: You do not have '${action}' permission for the ${moduleName} module.`,
      });
    }

    // Default fallback allow or return forbidden
    return res.status(403).json({
      success: false,
      error: 'Access Denied: Insufficient administrative rights.',
    });
  };
};
