const { getEnvPath } = require('./seedUtils');
const path = require('path');

// Load environment variables from the correct path
require('dotenv').config({ path: getEnvPath() });
const { connectDB } = require('../config/database');
const UserService = require('../services/userService');
const OrganizationService = require('../services/organizationService');
const User = require('../models/User');
const Organization = require('../models/Organization');

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    console.log('Using environment file:', getEnvPath());

    // Connect to the database
    await connectDB();

    console.log('Connected to the database');

    // Check if admin user already exists
    const existingAdmin = await UserService.getByEmail('admin@saaswork.com');

    if (!existingAdmin) {
      console.log('Creating admin user...');

      // Create admin user
      const adminUser = await UserService.create({
        email: 'admin@saaswork.com',
        password: 'admin123', // INPUT_REQUIRED {Change this password for production use}
        name: 'Admin User',
        role: 'admin',
        subscriptionStatus: 'active',
        paymentVerified: true
      });

      console.log('Admin user created successfully:', adminUser.email);

      // Verify the admin was created
      const verifyAdmin = await UserService.getByEmail('admin@saaswork.com');
      if (!verifyAdmin) {
        throw new Error('Failed to create admin user - not found after creation');
      }
    } else {
      console.log('Admin user already exists, skipping creation');
    }

    // Create some test organizations
    const organizations = [
      { name: 'Test Organization 1', industry: 'Technology' },
      { name: 'Test Organization 2', industry: 'Healthcare' },
      { name: 'Test Organization 3', industry: 'Education' }
    ];

    for (const org of organizations) {
      try {
        const existingOrg = await Organization.findOne({ name: org.name });

        if (!existingOrg) {
          console.log(`Creating organization: ${org.name}`);
          const newOrg = await OrganizationService.create(org);

          // Create an organization manager for each org
          const managerEmail = `manager_${org.name.toLowerCase().replace(/\s+/g, '_')}@example.com`;
          const existingManager = await UserService.getByEmail(managerEmail);

          if (!existingManager) {
            console.log(`Creating organization manager: ${managerEmail}`);
            await UserService.create({
              email: managerEmail,
              password: 'password123', // INPUT_REQUIRED {Change this password for production use}
              name: `Manager for ${org.name}`,
              organizationId: newOrg._id,
              role: 'organization_manager',
              subscriptionStatus: 'active',
              paymentVerified: true
            });
            console.log(`Organization manager created successfully: ${managerEmail}`);
          } else {
            console.log(`Organization manager already exists: ${managerEmail}, skipping creation`);
          }

          // Create a few team members for each organization
          for (let i = 1; i <= 2; i++) {
            try {
              const memberEmail = `member${i}_${org.name.toLowerCase().replace(/\s+/g, '_')}@example.com`;
              const existingMember = await UserService.getByEmail(memberEmail);

              if (!existingMember) {
                console.log(`Creating team member: ${memberEmail}`);
                await UserService.create({
                  email: memberEmail,
                  password: 'password123', // INPUT_REQUIRED {Change this password for production use}
                  name: `Team Member ${i} for ${org.name}`,
                  organizationId: newOrg._id,
                  role: 'team_member',
                  subscriptionStatus: 'none',
                  paymentVerified: false
                });
                console.log(`Team member created successfully: ${memberEmail}`);
              } else {
                console.log(`Team member already exists: ${memberEmail}, skipping creation`);
              }
            } catch (memberError) {
              console.error(`Error creating team member for ${org.name}:`, memberError);
              // Continue with the next team member
            }
          }
        } else {
          console.log(`Organization "${org.name}" already exists, skipping creation`);
        }
      } catch (orgError) {
        console.error(`Error processing organization ${org.name}:`, orgError);
        // Continue with the next organization
      }
    }

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();