# SaaS Work

SaaS Work is an advanced SaaS platform designed to offer UK GDPR-compliant AI chatbots to organizations, built with Vue.js and Tailwind CSS. The application features a robust role-based system, integrated with Stripe for subscription management, and dynamically populated AI models from providers like OpenAI.

## Overview

The SaaS Work platform is architected into a client-server model, leveraging modern JavaScript frameworks and libraries:

### Architecture and Technologies
- **Frontend**: Built using React.js with Vite, Tailwind CSS, and shadcn-ui.
- **Backend**: Powered by an Express.js server with MongoDB for data storage, and Mongoose for ORM.
- **User Authentication**: Managed via a token-based system (JWT).
- **Payments**: Integrated with Stripe for seamless subscription management.
- **API**: RESTful API endpoints for data operations.
- **AI Integration**: Fetch and manage AI models dynamically from providers like OpenAI.

### Project Structure

```
saas-work/
│
├── client/
│   ├── components/
│   ├── pages/
│   ├── api/
│   ├── contexts/
│   ├── hooks/
│   ├── styles/
│   ├── vite.config.ts
│   ├── package.json
│   └── ...
│
├── server/
│   ├── routes/
│   ├── models/
│   ├── services/
│   ├── utils/
│   ├── package.json
│   └── ...
│
├── .env
├── .gitignore
└── README.md
```

## Features

- **Role-based Access Control**: Allows different permissions for SaaS Admins, Organization Managers, and Team Members.
- **Dynamic AI Model Selection**: Fetches and lists the latest AI models from providers like OpenAI.
- **Stripe Integration**: Manages user subscriptions and payments.
- **GDPR Compliance**: Ensures data handling and processing meet UK GDPR standards.
- **User Management**: Allows editing user details and role assignments from the admin dashboard.
- **Real-time Updates**: Provides real-time data on active users and other critical stats.
- **Comprehensive Dashboard**: Includes stats, AI chatbot management, organization details, and user profiles.
- **Password Management**: Supports password reset and change functionalities.
- **Detailed Hero Page**: Offers a professional presentation of platform features and direct access to the pricing section.

## Getting started

### Requirements

Ensure you have the following installed on your system:

- Node.js (v14 or above)
- npm (v6 or above)
- MongoDB

### Quickstart

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd saas-work
   ```

2. **Install dependencies**

   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

3. **Setup environment variables**

   Create a `.env` file in both the root and `server` directories, and set the necessary environment variables. 

4. **Run the application**

   In the root directory, run:

   ```bash
   npm run start
   ```

   This command will start both the client and server concurrently.

5. **Access the application**

   Open your browser and navigate to `http://localhost:5173` to access the frontend.

### License

The project is proprietary (not open source), Copyright (c) 2024.
