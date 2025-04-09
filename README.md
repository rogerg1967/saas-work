```markdown
# SaaS Work

SaaS Work is a SaaS platform designed to offer UK GDPR compliant AI chatbots to organizations. Built using Vue.js and Tailwind CSS, it includes a comprehensive database for storing data. The platform is designed with a detailed and professional hero page showcasing the platform's offerings and pricing, aiming to convert visitors into users through a guided registration and subscription process. Additionally, the application features role-based administration, AI chatbot management, dynamic model integration based on AI providers, and robust subscription management using Stripe.

## Overview

The project is architected with a clear separation between the frontend and backend, each built with modern, robust technologies:
- **Frontend**: Developed using Vue.js and Tailwind CSS within the `client/` directory, it leverages Vite as the development server, and includes client-side routing using `react-router-dom`. The frontend requests are interfaced through `/api/` endpoints to communicate with the backend.
- **Backend**: Built using Express.js and housed in the `server/` directory, it features a REST API structure, interfacing with a MongoDB database using Mongoose. The backend also handles authentication using JWT tokens, integrated payment processing through Stripe, and various routes and services for managing users, organizations, and AI chatbot functionalities.

Both parts of the application run concurrently during development using a single command.

### Project Structure

**Frontend:**
- **`client/`**
  - `components/`: UI components and shared elements.
  - `pages/`: Specific pages of the application.
  - `api/`: API request abstractions and mock data management.
  - `context/`: Context for global state management like authentication.
  - `hooks/`: Custom hooks for various functionalities.

**Backend:**
- **`server/`**
  - `models/`: Mongoose schemas for data models.
  - `routes/`: Route handlers for different API endpoints.
  - `services/`: Service layers for business logic.
  - `utils/`: Utility functions for authentication, password management, etc.
  - `config/`: Configuration files for database and server setup.
  - `constants/`: Constants for role definitions and other static values.

## Features

- **Professional Hero Page**: A detailed and engaging hero page with platform information and pricing options.
- **User and Organization Management**: Role-based access with SAAS admins managing organizations and users joining existing organizations upon admin approval.
- **Dynamic AI Model Integration**: Integration with AI providers like OpenAI to dynamically fetch and display available AI models.
- **Subscription Management**: Comprehensive subscription management using Stripe, including plan selection, payments, and invoicing.
- **Chatbot Management**: Creation, editing, and deletion of AI chatbots, with user-friendly error messaging and clarification.
- **Real-time Data**: Real-time active users display on the dashboard, requiring backend services to track and update user activities.
- **User Profile and Settings**: Users can edit their profiles, reset passwords, and manage personal details from their profile pages.
- **Error Handling and Messaging**: User-friendly error messages and toast notifications for better user experience and troubleshooting.
- **Authentication and Security**: Robust JWT-based authentication with access and refresh tokens, and secure handling of password changes and validations.

## Getting Started

### Requirements

To run this project locally, ensure you have the following technologies installed on your system:
- Node.js (16.x or higher)
- npm (8.x or higher)
- MongoDB (4.x or higher)

### Quickstart

Follow these steps to set up the project locally:

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/saas-work.git
   cd saas-work
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the `server/` directory with the following content:
   ```
   PORT=3000
   DB_HOST=mongodb://localhost:27017/saaswork
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_token_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

4. **Seed the database:**
   Run the seed script to populate the database with initial data:
   ```sh
   node server/scripts/seed.js
   ```

5. **Start the development server:**
   ```sh
   npm run start
   ```

   - The frontend will be available at: `http://localhost:5173/`
   - The backend API will run at: `http://localhost:3000/`

### License

The project is proprietary. All rights reserved.

Copyright (c) 2024.
```
