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
}

module.exports = OrganizationService;