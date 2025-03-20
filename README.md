```markdown
# SaaS Work

SaaS Work is a comprehensive software-as-a-service (SaaS) platform designed using Vue.js and Tailwind CSS with a MongoDB database. The primary goal of the platform is to provide UK GDPR-compliant AI chatbots to organizations. The platform includes a detailed hero page showcasing offerings and a pricing section that encourages user engagement from the first interaction. The platform is role-based, including functionalities for organizational management, subscription management, and chatbot management.

## Overview

SaaS Work employs a modern architecture with separate front-end and back-end services to ensure scalability and maintainability. The front end is built using React with Vite, while the back end is an Express-based server. Tailwind CSS is used for styling, and MongoDB is the database of choice.

### Architecture
- **Frontend:** ReactJS, Vite, Tailwind CSS
- **Backend:** ExpressJS, MongoDB, Mongoose
- **Authentication:** JWT for token-based authentication
- **Payment Gateway:** Stripe for subscription management

### Project Structure

```
/
├── client/                   # Frontend codebase
│   ├── src/
│   │   ├── api/              # API request files
│   │   ├── components/       # Reusable UI components
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   ├── pages/            # Page components
│   │   ├── services/         # Services for subscription handling
│   │   ├── App.tsx           # Main application component
│   │   └── main.tsx          # Application entry point
│   ├── public/               # Public assets
│   ├── index.html            # Main HTML entry point
│   ├── package.json          # Frontend dependencies and scripts
│   └── tailwind.config.js    # Tailwind CSS configuration
├── server/                   # Backend codebase
│   ├── models/               # Mongoose models
│   ├── routes/               # API routes
│   ├── scripts/              # Database seeding scripts
│   ├── services/             # Business logic services
│   ├── utils/                # Utility functions
│   ├── server.js             # Server entry point
│   └── package.json          # Backend dependencies and scripts
├── .env                      # Environment variables configuration
├── .gitignore                # Files ignored by Git
└── README.md                 # Project documentation
```


## Features

- **User Management:**
  - Role-based access control (Admin, Organization Manager, and Team Member roles)
  - User registration, login, and profile management
  - Password reset functionality

- **Organization Management:**
  - SaaS Admins can add organizations
  - Users can request to join existing organizations
  - CRUD operations for organizations

- **Subscription Management:**
  - Subscription plans and Stripe integration
  - User subscription management (create, update, cancel subscriptions)

- **Chatbot Management:**
  - AI chatbot creation, editing, and deletion
  - Integration with AI providers like OpenAI
  - Real-time updates of available AI models

- **Admin Features:**
  - Admin dashboard for managing users and organizations
  - Real-time active user tracking and analytics

## Getting started

### Requirements

- Node.js (v16.x or higher)
- npm (v7.x or higher)
- MongoDB (v4.x or higher)
- Stripe account for accessing the Stripe API

### Quickstart

1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-username/saas-work.git
   cd saas-work
   ```

2. **Setup environment variables:**
   Create a `.env` file in the root directory and add the necessary configurations:
   ```plaintext
   PORT=3000
   MONGO_URI='your_mongo_connection_string'
   JWT_SECRET='your_jwt_secret'
   JWT_REFRESH_SECRET='your_refresh_jwt_secret'
   STRIPE_SECRET_KEY='your_stripe_secret_key'
   STRIPE_WEBHOOK_SECRET='your_stripe_webhook_secret'
   ```

3. **Install dependencies:**
   ```sh
   npm install
   cd client && npm install
   cd ..
   cd server && npm install
   cd ..
   ```

4. **Run the development environment:**
   ```sh
   npm run start
   ```

   The frontend will be served at `http://localhost:5173` and the backend at `http://localhost:3000`.

### License

The project is proprietary (not open source), Copyright (c) 2024.
```