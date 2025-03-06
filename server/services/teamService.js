const UserService = require('./userService.js');

class TeamService {
  // Get team members by organization ID
  static async getMembers(organizationId) {
    try {
      console.log(`Fetching team members for organization: ${organizationId}`);
      const users = await UserService.list();
      return users.filter(user =>
        user.organizationId && user.organizationId.toString() === organizationId.toString()
      );
    } catch (err) {
      console.error(`Error while getting team members for organization ${organizationId}:`, err);
      throw new Error(`Database error while getting team members: ${err}`);
    }
  }

  // Create a new team member
  static async createMember({ name, email, role, phone, organizationId, createdBy }) {
    try {
      console.log(`Creating new team member in organization ${organizationId} with email: ${email}`);

      // Generate a random password for the new user (they'll need to reset it)
      const randomPassword = Math.random().toString(36).slice(-8);

      // Create a new user with the team_member role
      const user = await UserService.create({
        email,
        password: randomPassword, // This should be reset by the user
        name,
        organizationId,
        role: 'team_member', // Always set role to team_member
        metadata: { phone, addedBy: createdBy }
      });

      // Here you would typically send an invitation email with password reset instructions
      // For now we'll just log this
      console.log(`Team member ${email} created with temporary password: ${randomPassword}`);

      return user;
    } catch (err) {
      console.error(`Error while creating team member with email ${email}:`, err);
      throw new Error(`Error while creating team member: ${err.message}`);
    }
  }

  // Update an existing team member
  static async updateMember(id, { name, role, email, phone }) {
    try {
      console.log(`Updating team member with ID: ${id}`);

      // Get current user data
      const user = await UserService.get(id);
      if (!user) {
        throw new Error('Team member not found');
      }

      // Update user data
      const updateData = {
        name,
        email,
        // Store phone in metadata since it's not a direct field in the User model
        metadata: { ...user.metadata, phone }
      };

      // Update the user
      return await UserService.update(id, updateData);
    } catch (err) {
      console.error(`Error while updating team member with ID ${id}:`, err);
      throw new Error(`Error while updating team member: ${err.message}`);
    }
  }

  // Delete a team member
  static async deleteMember(id) {
    try {
      console.log(`Deleting team member with ID: ${id}`);
      return await UserService.delete(id);
    } catch (err) {
      console.error(`Error while deleting team member with ID ${id}:`, err);
      throw new Error(`Error while deleting team member: ${err.message}`);
    }
  }
}

module.exports = TeamService;