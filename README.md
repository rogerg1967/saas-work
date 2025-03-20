# SaaS Work

SaaS Work is a platform using Vue.js and Tailwind CSS, designed to provide UK GDPR-compliant AI chatbots tailored for organizations. The primary objective is to deliver role-based access to AI-driven chatbots ensuring data protection and compliance. The platform includes features for organization and user management, subscription handling via Stripe, and integration with various AI providers for dynamic model updating.

## Overview

The application architecture comprises a frontend built using React, Vite, and Tailwind CSS, and a backend powered by Express.js and MongoDB. 

### Project Structure

```plaintext
saas-work/
├── client/                  # Frontend codebase
│   ├── src/
│   │   ├── api/             # API request handlers
│   │   ├── components/      # UI components
│   │   ├── contexts/        # React context files
│   │   ├── hooks/           # React hooks
│   │   ├── pages/           # Page components
│   │   ├── index.css        # Global CSS
│   │   ├── main.tsx         # Main entry point for React
│   │   └── vite.config.ts   # Vite configuration
│   ├── public/
│   ├── package.json         # Frontend dependencies and scripts
│   └── tsconfig.json        # TypeScript configuration
├── server/                  # Backend codebase
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   ├── services/            # Service layer for business logic
│   ├── utils/               # Utility functions
│   ├── config/              # Database connection configurations
│   ├── scripts/             # Database seed scripts
│   ├── package.json         # Backend dependencies and scripts
│   └── server.js            # Express server setup
└── .env                     # Environment variables
```

## Features

- **Role-Based Access Control**: Separation of roles such as SaaS Admin, Organization Manager, and Team Member.
- **Organization Management**: Admins can manage organizations and assign users.
- **User Registration and Subscription**: New users can register and subscribe via Stripe to gain access.
- **AI Model Integration**: Flexible integration with AI providers like OpenAI and Anthropic, with dynamic model selection.
- **Chatbot Features**: Create, edit, and delete chatbots; real-time updates and message handling with AI responses.
- **Real-time Data**: Active user tracking and real-time updates on dashboards.
- **GDPR Compliance**: Ensuring all interactions and data handling adhere to UK GDPR guidelines.

## Getting Started

### Requirements

To run the project locally, you will need:

- Node.js (version 14.x or later)
- npm (version 6.x or later)
- MongoDB (version 4.x or later)

### Quickstart

1. **Clone the Repository**:
    ```bash
    git clone https://github.com/yourusername/saas-work.git
    cd saas-work
    ```

2. **Set Up Environment Variables**:
   Create a `.env` file in both `client/` and `server/` folders using the provided `.env.example` as a template and fill in the necessary values.

3. **Install Dependencies**:
    - For the backend:
      ```bash
      cd server
      npm install
      ```

    - For the frontend:
      ```bash
      cd ../client
      npm install
      ```

4. **Run the Database Seed Script** (Optional, for initial data):
    - Ensure MongoDB is running.
    - From the `server` directory:
      ```bash
      npm run seed
      ```

5. **Start the Application**:
   In the project root directory, run:
    ```bash
    npm run start
    ```
   This will concurrently start both the client and server.

6. **Access the Application**:
   Open your browser and navigate to `http://localhost:5173/`.

### License

The project is proprietary (not open source).

```plaintext
Copyright (c) 2024.
```