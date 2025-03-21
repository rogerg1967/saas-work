const User = require('../models/User');
const StripeService = require('./stripeService');

class SubscriptionService {
  /**
   * Get user's subscription details
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User's subscription details
   */
  static async getUserSubscription(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      return {
        subscriptionStatus: user.subscriptionStatus,
        subscriptionId: user.subscriptionId,
        paymentVerified: user.paymentVerified,
        subscription: user.subscription,
        customerId: user.customerId
      };
    } catch (error) {
      console.error(`Error getting user subscription: ${error.message}`);
      throw new Error(`Failed to get user subscription: ${error.message}`);
    }
  }

  /**
   * Suspend user's subscription
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Updated subscription details
   */
  static async suspendSubscription(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.subscriptionId) {
        throw new Error('No active subscription found');
      }

      // Call Stripe to cancel the subscription at period end
      const result = await StripeService.cancelSubscription(user.subscriptionId);

      // Update user's subscription status
      user.subscription.cancelAtPeriodEnd = true;
      await user.save();

      return {
        subscriptionStatus: user.subscriptionStatus,
        cancelAtPeriodEnd: true,
        currentPeriodEnd: user.subscription.currentPeriodEnd
      };
    } catch (error) {
      console.error(`Error suspending subscription: ${error.message}`);
      throw new Error(`Failed to suspend subscription: ${error.message}`);
    }
  }

  /**
   * Get user's invoices
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - User's invoices
   */
  static async getUserInvoices(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.customerId) {
        return [];
      }

      // Get invoices from Stripe
      const invoices = await StripeService.getCustomerInvoices(user.customerId);

      // Update user's invoices in the database
      user.invoices = invoices.map(invoice => ({
        invoiceId: invoice.id,
        amount: invoice.amount_paid / 100,
        currency: invoice.currency,
        status: invoice.status,
        date: new Date(invoice.created * 1000),
        pdfUrl: invoice.invoice_pdf
      }));
      await user.save();

      return user.invoices;
    } catch (error) {
      console.error(`Error getting user invoices: ${error.message}`);
      throw new Error(`Failed to get user invoices: ${error.message}`);
    }
  }

  /**
   * Update user's subscription status (admin only)
   * @param {string} userId - User ID
   * @param {string} status - New subscription status
   * @returns {Promise<Object>} - Updated subscription details
   */
  static async updateSubscriptionStatus(userId, status) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Validate status
      const validStatuses = ['active', 'cancelled', 'paused', 'past_due', 'unpaid', 'trialing', 'expired'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      // Update user's subscription status
      user.subscriptionStatus = status;
      await user.save();

      return {
        subscriptionStatus: user.subscriptionStatus,
        subscriptionId: user.subscriptionId,
        subscription: user.subscription
      };
    } catch (error) {
      console.error(`Error updating subscription status: ${error.message}`);
      throw new Error(`Failed to update subscription status: ${error.message}`);
    }
  }
}

module.exports = SubscriptionService;