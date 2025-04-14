# SaaS Work

SaaS Work is a Software-as-a-Service (SaaS) platform built to provide UK GDPR compliant AI chatbots to organizations. The primary goal is to offer a professional, detailed hero page highlighting platform offerings, role-based access, and a seamless registration and subscription process. Using Vue.js, Tailwind CSS, and a MongoDB database, the platform integrates dynamic AI chatbot capabilities and efficient user management.

## Overview

SaaS Work leverages a modular architecture comprising a ReactJS-based frontend and an Express backend. Key technologies and components include:

- **Frontend**:
  - **ReactJS**: Main framework for building user interfaces.
  - **Vite**: Development server.
  - **Tailwind CSS**: Styling framework.
  - **Shadcn UI**: Component library.
  - **React Router**: Client-side routing.
  - **Axios**: HTTP client for API requests.

- **Backend**:
  - **Express**: Framework for handling server-side logic.
  - **MongoDB & Mongoose**: Database and ORM.
  - **JWT**: Token-based authentication.
  - **Stripe**: Subscription and payment integration.
  - **Middleware**: For authentication, authorization, and subscription checks.

**Project Structure**:

```
.
├── client             # Frontend code
│   ├── public         # Public assets
│   ├── src            # Source code
│   │   ├── api        # API requests
│   │   ├── components # React Components
│   │   ├── constants  # Constants used in the project
│   │   ├── contexts   # Contexts for state management
│   │   ├── hooks      # Custom hooks
│   │   ├── lib        # Utility functions
│   │   ├── pages      # Page components
│   │   ├── services   # Specific services used across the app
│   │   ├── styles     # Global styles
│   │   └── utils      # Utility functions
│   ├── .env           # Environment variables
│   ├── package.json   # Project metadata and dependencies
│   └── vite.config.ts # Vite configuration
├── server           # Backend code
│   ├── config       # Configuration files
│   ├── constants    # Constants used in the project
│   ├── models       # Mongoose models
│   ├── routes       # Express routes
│   ├── scripts      # Utility scripts
│   ├── services     # Business logic services
│   ├── utils        # Utility functions
│   ├── .env         # Environment variables
│   ├── server.js    # Entry point for the backend server
│   └── package.json # Project metadata and dependencies
├── .gitignore       # Files and directories to ignore in Git
└── README.md        # Project documentation
```

## Features

- **Role-Based Access Control**: SaaS admins manage organizations, users, and subscriptions.
- **Detailed Hero Page**: Provides comprehensive information about platform offerings and pricing.
- **Dynamic AI Chatbots**: Integrates with AI providers to fetch and display the latest models. Users can edit and delete chatbots, upload images for AI analysis, and maintain conversation histories.
- **Stripe Integration**: Handles subscription payments and updates user subscription statuses.
- **Admin and User Management**: Admins can edit user details, reassign users to organizations, and manage subscriptions.
- **Real-Time Active Users**: Displays real-time active user data on the dashboard.

## Getting Started

### Requirements

Before running the project, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **MongoDB** (v4.2 or higher)

### Quickstart

To set up the project and run it locally:

1. **Clone the repository**:
   ```bash
   git clone <repository-link>
   cd saas-work
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   - In both the `client` and `server` directories, create a `.env` file based on the provided `.env.example` files.

4. **Run the development server**:
   ```bash
   npm run start
   ```

5. **Access the application**:
   - The frontend is available at `http://localhost:5173`
   - The backend API is available at `http://localhost:3000/api`

### License

The project is proprietary (not open source). Copyright (c) 2024.

---

By following the above instructions, you can get the SaaS Work platform running locally for development and testing. The platform's scalable architecture ensures ease of maintenance and future enhancements.