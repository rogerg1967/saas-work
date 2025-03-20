const { randomUUID } = require('crypto');

const User = require('../models/User.js');
const { generatePasswordHash, validatePassword } = require('../utils/password.js');

class UserService {
  static async list() {
    try {
      console.log('Fetching list of all users');
      return User.find();
    } catch (err) {
      console.error('Error while listing users:', err);
      throw new Error(`Database error while listing users: ${err}`);
    }
  }

  static async get(id) {
    try {
      console.log(`Fetching user with ID: ${id}`);
      return User.findOne({ _id: id }).exec();
    } catch (err) {
      console.error(`Error while getting user with ID ${id}:`, err);
      throw new Error(`Database error while getting the user by their ID: ${err}`);
    }
  }

  static async getByEmail(email) {
    try {
      console.log(`Fetching user with email: ${email}`);
      return User.findOne({ email }).exec();
    } catch (err) {
      console.error(`Error while getting user with email ${email}:`, err);
      throw new Error(`Database error while getting the user by their email: ${err}`);
    }
  }

  static async update(id, data) {
    try {
      console.log(`Updating user with ID: ${id}`);
      return User.findOneAndUpdate({ _id: id }, data, { new: true, upsert: false });
    } catch (err) {
      console.error(`Error while updating user with ID ${id}:`, err);
      throw new Error(`Database error while updating user ${id}: ${err}`);
    }
  }

  static async delete(id) {
    try {
      console.log(`Deleting user with ID: ${id}`);
      const result = await User.deleteOne({ _id: id }).exec();
      return (result.deletedCount === 1);
    } catch (err) {
      console.error(`Error while deleting user with ID ${id}:`, err);
      throw new Error(`Database error while deleting user ${id}: ${err}`);
    }
  }

  static async authenticateWithPassword(email, password) {
    if (!email) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');

    try {
      console.log(`Authenticating user with email: ${email}`);
      const user = await User.findOne({email}).exec();
      if (!user) {
        console.log(`Authentication failed: User with email ${email} not found`);
        return null;
      }

      const passwordValid = await validatePassword(password, user.password);
      if (!passwordValid) {
        console.log(`Authentication failed: Invalid password for user ${email}`);
        return null;
      }

      user.lastLoginAt = Date.now();
      const updatedUser = await user.save();
      console.log(`User ${email} authenticated successfully`);
      return updatedUser;
    } catch (err) {
      console.error(`Error while authenticating user ${email}:`, err);
      throw new Error(`Database error while authenticating user ${email} with password: ${err}`);
    }
  }

  static async create({ email, password, name = '', organizationId = null, role = 'team_member', subscriptionStatus = 'none', paymentVerified = false, registrationStatus = 'incomplete' }) {
    if (!email) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');

    console.log(`Creating new user with email: ${email}`);
    const existingUser = await UserService.getByEmail(email);
    if (existingUser) {
      console.log(`User creation failed: User with email ${email} already exists`);
      throw new Error('User with this email already exists');
    }

    const hash = await generatePasswordHash(password);

    try {
      const user = new User({
        email,
        password: hash,
        name,
        organizationId,
        role,
        subscriptionStatus,
        paymentVerified,
        registrationStatus
      });

      await user.save();
      console.log(`User ${email} created successfully`);
      return user;
    } catch (err) {
      console.error(`Error while creating user with email ${email}:`, err);
      throw new Error(`Database error while creating new user: ${err}`);
    }
  }

  static async setPassword(user, password) {
    if (!password) throw new Error('Password is required');

    console.log(`Setting password for user: ${user.email}`);
    user.password = await generatePasswordHash(password); // eslint-disable-line

    try {
      if (!user.isNew) {
        await user.save();
      }

      console.log(`Password set successfully for user: ${user.email}`);
      return user;
    } catch (err) {
      console.error(`Error while setting password for user ${user.email}:`, err);
      throw new Error(`Database error while setting user password: ${err}`);
    }
  }
}

module.exports = UserService;