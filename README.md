# SaaS Work

SaaS Work is a comprehensive SAAS platform designed to provide UK GDPR-compliant AI chatbots to organizations. Built using Vue.js and Tailwind CSS for the frontend, and a MongoDB database for data storage. The primary objective of the platform is to offer customizable AI chatbots that adhere to stringent data protection standards, facilitating seamless communication and engagement for businesses.

## Overview

SaaS Work employs a modern tech stack to ensure scalability, reliability, and ease of use. The platform is structured into two main components:

### Architecture and Technologies Used
- **Frontend**:
  - Hosted in the `client/` folder
  - Developed using ReactJS with Vite as the development server
  - Styled using Tailwind CSS integrated with shadcn-ui component library
  - Client-side routing with `react-router-dom`
  - Runs on port 5173

- **Backend**:
  - Hosted in the `server/` folder
  - Built using Express.js to serve REST API endpoints
  - MongoDB as the database, interfaced with Mongoose
  - Handles authentication through token-based (JWT) methods
  - Runs on port 3000

### Project Structure
The project directory is divided into `client/` for the frontend and `server/` for the backend.

- **Frontend**:
  - `client/src/pages/`: Contains page components like Home, Login, Register, Dashboard, etc.
  - `client/src/components/`: Reusable UI components
  - `client/src/api/`: Handles API requests to the backend
  - `client/tailwind.config.js`: Tailwind CSS configuration

- **Backend**:
  - `server/routes/`: Express routes for handling various backend functionalities
  - `server/services/`: Services implementing the core business logic
  - `server/models/`: Mongoose schemas and models for MongoDB collections
  - `server/utils/`: Utility functions, including authentication and password handling

## Features

SaaS Work is packed with features to enhance user experience and administrative control:

- **User Management**:
  - Role-based access with different tiers i.e., SAAS Admin, Organization Manager, and Team Members
  - User registration with org joining requests needing approval
  - Profile management including password update functionality

- **AI Chatbots**:
  - Admin-defined chatbot models, dynamically populated based on the selected AI provider
  - Real-time data integration with OpenAI for fetching and updating AI models
  - CRUD operations on chatbots

- **Subscriptions**:
  - Stripe integration for handling subscription payments
  - Access control based on subscription status

- **Dashboard**:
  - Real-time display of active users
  - Comprehensive management of organizations and users

- **Other Functionalities**:
  - Side navigation with user profile link and logout option
  - Industry field auto-completion from the database
  - Implemented a friendly error messaging system

## Getting Started

### Requirements

To set up and run the SaaS Work platform locally, you need the following:
- Node.js (v12.x or higher)
- npm (v6.x or higher)
- MongoDB (v4.x or higher)
- Stripe account for integrating payment processing

### Quickstart

Follow these steps to get the project up and running:

1. **Clone the Repository**
   ```bash
   git clone <repository_url>
   cd saas-work
   ```

2. **Install Dependencies**
   ```bash
   npm install
   cd client
   npm install
   cd ../server
   npm install
   ```

3. **Configure Environment Variables**
   - Create a `.env` file in the root, `client/` and `server/` folders:
     ```bash
     # .env
     PORT=3000
     MONGO_URI=<MongoDB connection string>
     JWT_SECRET=<Your JWT secret>
     STRIPE_SECRET_KEY=<Your Stripe secret key>
     ```

4. **Seed the Database**
   (optional) If you wish to seed initial data, run:
   ```bash
   node server/scripts/seed.js
   ```

5. **Run the Development Server**
   ```bash
   npm run start
   ```

6. **Access the Application**
   Open your browser and navigate to `http://localhost:5173`.

### License

The project is proprietary. 
```
© 2024 SaaS Work. All rights reserved.
```
