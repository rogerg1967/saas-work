# SaaS Work

SaaS Work is a platform providing UK GDPR-compliant AI chatbots to organizations. Built using Vue.js and Express, it offers role-based access, user management, and payment integration to ensure seamless chatbot deployment and management for UK organizations.

## Overview

SaaS Work employs a dual architecture comprising a ReactJS-based frontend and an Express-based backend. The frontend is set up in the `client/` folder, using Vite as the development server, Tailwind CSS for styling, and Shadcn-ui component library. The backend resides in the `server/` folder, implementing REST API endpoints and employing MongoDB for data storage with Mongoose as an ORM.

### Architecture 

- **Frontend**:
  - ReactJS (hosted in `client/` directory)
  - Tailwind CSS
  - Shadcn-ui component library
  - Vite development server
  - Client-side routing using `react-router-dom`

- **Backend**:
  - ExpressJS (hosted in `server/` directory)
  - MongoDB with Mongoose
  - Token-based authentication using bearer access and refresh tokens
  - REST API endpoints
  - Stripe for payment integration

### Project Structure 

- `client/`: Contains all frontend code and assets.
  - `src/`: Source files for the frontend, including components, pages, contexts, hooks, and API wrappers.
  - `api/`: API request definitions with mocking support.
  - `components/`: Reusable UI components.
  - `pages/`: React components corresponding to different routes/views.
  - `contexts/`: React contexts for managing states like authentication.
  - `hooks/`: Custom React hooks.

- `server/`: Contains all backend code.
  - `models/`: Mongoose schema definitions.
  - `routes/`: Express route definitions.
  - `services/`: Business logic abstraction layers.
  - `utils/`: Helper functions and utilities.
  - `config/`: Database configuration and environment variable management.

## Features

- **Hero Page & Authentication**:
  - Beautiful landing page to display the solution offerings.
  - Registration with request to join existing organizations.
  - Authentication using email and password.

- **User Roles & Management**:
  - Role-based access control: Admins, Organization Managers, and Team Members.
  - SAAS admins manage organizations and users from the admin dashboard.
  - Organization Managers manage their organization's settings and AI Chatbots.

- **Payment Processing**:
  - Integrated with Stripe for subscription management.
  - Access granted only after successful subscription payment.

- **AI Chatbot Management**:
  - Selection of AI models dynamically populated based on chosen AI provider.
  - CRUD operations on AI chatbots.
  - Integration with OpenAI to fetch and update the latest AI models.

- **Dashboard Features**:
  - Real-time display of active users.
  - Subscription plans and payment processing through Stripe.

- **Admin Tools**:
  - Editing and deleting users and organizations.
  - Reassignment of users to different organizations.

## Getting Started

### Requirements

To run SaaS Work, you need to have the following installed on your computer:
- Node.js (v14 or later)
- npm (v6 or later)
- MongoDB

### Quickstart

1. **Clone the repository**:
   ```bash
   git clone <repo_url>
   cd saas-work
   ```

2. **Set up environment variables**:
   Create a `.env` file in both `client/` and `server/` directories with the following content and adjust according to your setup:
   ```ini
   # .env file for the Server
   PORT=3000
   DATABASE_URL=mongodb://localhost:27017/saaswork
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_jwt_refresh_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

3. **Install dependencies**:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

4. **Run the development server**:
   ```bash
   # You can run both the client and server concurrently using:
   npm run start
   ```

   This will start the client on [http://localhost:5173](http://localhost:5173) and the server on [http://localhost:3000](http://localhost:3000).

5. **Seed the database** (Optional):
   ```bash
   cd server
   npm run seed
   ```

### License

```
© 2024 Your Company. All rights reserved.
```