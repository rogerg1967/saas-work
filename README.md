# SaaS Work

SaaS Work is a platform designed to provide UK GDPR-compliant AI chatbots to organizations using Vue.js and Tailwind CSS. The platform includes role-based access and functionality for SaaS admins, organization managers, and team members. It features user sign-up, subscription management through Stripe, and integration with OpenAI for dynamically populating AI chatbot models. Additionally, it includes real-time active user tracking and data management through MongoDB.

## Overview

SaaS Work consists of two main parts:

1. **Frontend**:
    - Built with Vue.js and Tailwind CSS.
    - Uses Vite as the development server running on port 5173.
    - Incorporates `shadcn-ui` component library.
    - Client-side routing implemented with `react-router-dom`.
    - Features include login, registration, subscription, and dashboard pages.

2. **Backend**:
    - Express-based server with REST API endpoints.
    - PostgreSQL database managed with Sequelize ORM.
    - Handles authentication using JSON Web Tokens (JWT).
    - Role-based access control for different user roles.
    - Stripe integration for subscription payments.

## Features

- **Role-Based Access Control**:
  - SaaS Admin: Can manage organizations and users.
  - Organization Manager: Can manage organization-specific settings and members.
  - Team Member: Can access and utilize assigned chatbots.

- **User Sign-Up and Authentication**:
  - Registration Form: Collects profile details and allows users to request joining an organization.
  - Stripe Integration: Ensures subscription payment before accessing the application.

- **AI Chatbots Management**:
  - Dynamic Model Selection: Integrates with OpenAI to fetch the latest list of models.
  - Real-Time Updates: Uses API integration for regular model updates.
  - CRUD Operations: Allows users to create, edit, and delete chatbots.

- **Real-Time User Monitoring**:
  - Active Users Panel: Displays real-time data on current active users.
  - Background User Activity Recording: Asynchronously records user activity every 5 minutes.

## Getting started

### Requirements

To run this project, ensure you have the following installed:

- Node.js (v14.x or higher)
- npm (v6.x or higher)
- PostgreSQL (v12.x or higher)

### Quickstart

1. **Clone the repository**:
    ```bash
    git clone https://example.com/SaaS-Work.git
    cd SaaS-Work
    ```

2. **Set up environment variables**:
   - Create a `.env` file in both the `client/` and `server/` directories. Populate it with necessary configuration values like database URL, JWT secrets, and Stripe keys.

3. **Install dependencies**:
    ```bash
    # Install server dependencies
    cd server
    npm install

    # Install client dependencies
    cd ../client
    npm install
    ```

4. **Set up the database**:
   - Ensure your PostgreSQL database is running.
   - Run migrations and seed the database (if necessary).

5. **Run the application**:
    ```bash
    # Start the server
    cd server
    npm run start

    # Start the client
    cd client
    npm run start
    ```
   
   Navigate to `http://localhost:5173` to see the app in action.

## License

The project is proprietary. 

```
Copyright (c) 2024.
```