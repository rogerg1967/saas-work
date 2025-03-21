# SaaS Work

SaaS Work is a platform designed to provide UK GDPR-compliant AI chatbots to organizations, created using Vue.js and Tailwind CSS for frontend, and an Express-based backend. The platform features detailed onboarding processes, role-based access control, and comprehensive subscription management powered by Stripe.

## Overview

SaaS Work adopts a microservices-style architecture with a clear separation between frontend and backend services.

### Architecture and Technologies

**Frontend:**
- **Framework:** Vue.js
- **Styling:** Tailwind CSS
- **Components:** Integrated shadcn-ui components
- **Build Tool:** Vite
- **Routing:** `react-router-dom`

**Backend:**
- **Server:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT-based authentication (Bearer tokens)
- **Subscription Management:** Stripe

### Project Structure

**Frontend:**

    client/
    ├── src/
    │   ├── api/                   # API request definitions
    │   ├── components/            # Reusable components
    │   ├── hooks/                 # Custom hooks
    │   ├── pages/                 # Page components
    │   ├── App.tsx                # Main App component
    │   └── main.tsx               # Entry point of the application
    ├── public/                    # Static assets
    ├── .env                       # Environment variables
    └── vite.config.ts             # Vite configuration

**Backend:**

    server/
    ├── models/                    # Mongoose models
    ├── routes/                    # API route handlers
    ├── services/                  # Service layers for business logic
    ├── utils/                     # Utility functions
    ├── scripts/                   # Database seeding scripts
    ├── .env                       # Environment variables
    └── server.js                  # Entry point for the server

## Features

- **GDPR-compliant AI Chatbots:** Provides UK GDPR-compliant AI chatbot solutions powered by OpenAI or other AI providers.
- **Role-Based Access Control:** Supports roles including Admin, Organization Manager, and Team Member.
- **Subscription Management:** Uses Stripe to handle subscription payments, status updates, and invoice management.
- **Real-Time Data:** Updates dashboard with real-time data about active users.
- **Organization Management:** Administrators manage organizations and users via a dedicated interface.
- **Profile Management:** Users can edit their profile details and reset passwords.
- **Dynamic Model Selection:** Integrates with AI providers to fetch and display the latest model options.

## Getting started

### Requirements

Make sure you have the following installed on your development environment:

- **Node.js** (version 14 or newer)
- **npm** (version 6 or newer)
- **MongoDB** (version 4 or newer)

### Quickstart

1. **Clone the repository:**
   ```sh
   git clone <repository-url>
   cd saas-work
   ```

2. **Setup environment variables:**
   Create a `.env` file in both `client/` and `server/` directories and configure it as outlined in the respective `.env.example` files.

3. **Install dependencies:**
   ```sh
   npm install
   cd client && npm install
   cd ../server && npm install
   cd ..
   ```

4. **Run MongoDB:**
   Ensure your MongoDB server is running locally or update the database connection string in the `.env` file.

5. **Seed the database:**
   ```sh
   cd server
   node scripts/seed.js
   cd ..
   ```

6. **Start the application:**
   ```sh
   npm run start
   ```
   This command will concurrently run both the frontend and backend servers:
   - Frontend server: http://localhost:5173
   - Backend server: http://localhost:3000

### License

The project is proprietary (not open source). Copyright (c) 2024.
