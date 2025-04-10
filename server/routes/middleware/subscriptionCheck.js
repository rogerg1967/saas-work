const User = require('../../models/User');

const requireSubscription = async (req, res, next) => {
  try {
    // Skip check for admin users
    if (req.user && req.user.role === 'admin') {
      return next();
    }

    // Get the user from the database to check the most up-to-date payment status
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // For organization managers, check if they have a verified payment
    if (user.role === 'organization_manager') {
      if (user.paymentVerified) {
        return next();
      } else {
        return res.status(403).json({
          success: false,
          error: 'Payment required',
          redirectTo: '/subscription'
        });
      }
    }

    // For team members, check if their organization manager has a verified payment
    if (user.role === 'team_member' && user.organizationId) {
      const orgManager = await User.findOne({
        organizationId: user.organizationId,
        role: 'organization_manager'
      });

      // If no organization manager is found, allow access (this can be changed based on business requirements)
      if (!orgManager) {
        console.log(`No organization manager found for organization ${user.organizationId}, allowing team member access`);
        return next();
      }

      if (orgManager.paymentVerified) {
        return next();
      } else {
        return res.status(403).json({
          success: false,
          error: 'Organization subscription required',
          redirectTo: '/subscription'
        });
      }
    }

    // Default case - allow access
    next();
  } catch (error) {
    console.error(`Subscription check error: ${error.message}`, error);
    return res.status(500).json({
      success: false,
      error: 'Server error during subscription check'
    });
  }
};

module.exports = {
  requireSubscription
};