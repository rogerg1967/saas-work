const Organization = require('../models/Organization.js');

class OrganizationService {
  static async create({ name, industry = '' }) {
    if (!name) throw new Error('Organization name is required');

    try {
      console.log(`Creating new organization: ${name}`);
      const organization = new Organization({
        name,
        industry,
        status: 'pending',
      });

      await organization.save();
      console.log(`Organization "${name}" created successfully with ID: ${organization._id}`);
      return organization;
    } catch (err) {
      console.error(`Error while creating organization:`, err);
      throw new Error(`Database error while creating new organization: ${err.message}`);
    }
  }

  static async get(id) {
    try {
      console.log(`Fetching organization with ID: ${id}`);
      return Organization.findById(id).exec();
    } catch (err) {
      console.error(`Error while getting organization with ID ${id}:`, err);
      throw new Error(`Database error while getting the organization: ${err.message}`);
    }
  }

  static async update(id, { name, industry }) {
    try {
      console.log(`Updating organization with ID: ${id}`);
      const organization = await Organization.findById(id);

      if (!organization) {
        console.log(`No organization found with ID ${id}`);
        return null;
      }

      organization.name = name;
      if (industry !== undefined) {
        organization.industry = industry;
      }

      // The schema pre-save hook will automatically update the updatedAt
      await organization.save();
      console.log(`Organization with ID ${id} updated successfully`);
      return organization;
    } catch (err) {
      console.error(`Error while updating organization with ID ${id}:`, err);
      throw new Error(`Database error while updating the organization: ${err.message}`);
    }
  }

  static async delete(id) {
    try {
      console.log(`Deleting organization with ID: ${id}`);

      // First check if the organization exists
      const organization = await Organization.findById(id);

      if (!organization) {
        console.log(`No organization found with ID ${id}`);
        return null;
      }

      console.log(`Found organization: "${organization.name}" (${organization._id})`);

      // Proceed with deletion
      const result = await Organization.findByIdAndDelete(id).exec();

      if (result) {
        console.log(`Organization "${organization.name}" (${id}) deleted successfully`);
      }

      return result;
    } catch (err) {
      console.error(`Error while deleting organization with ID ${id}:`, err);
      throw new Error(`Database error while deleting the organization: ${err.message}`);
    }
  }
}

module.exports = OrganizationService;