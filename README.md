# SaaS Work

"SaaS Work" is a Software as a Service (SaaS) platform designed to provide UK GDPR compliant AI chatbots to organizations. The platform is developed using Vue.js and Tailwind CSS for the frontend, with a backend powered by Express.js and MongoDB. The primary objective of the platform is to offer role-based access for different levels of users, streamline the signup process, and ensure secure subscription management through Stripe.

## Overview

The "SaaS Work" platform leverages a modern tech stack to deliver a robust AI chatbot service. Here's an overview of the architecture and technologies used:

### Frontend
- **Framework**: Vue.js
- **Styling**: Tailwind CSS
- **Component Library**: Shadcn-ui
- **State Management**: Context API
- **Routing**: React Router

### Backend
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose)
- **Authentication**: Token-based (JWT with bearer access and refresh tokens)

### Project Structure
```
project/
│
├── client/                  # Frontend code
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── ...
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── ...
├── server/                  # Backend code
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── config/
│   ├── scripts/
│   ├── package.json
│   └── ...
├── .env
├── .gitignore
└── README.md
```

## Features

### User Management
- **Role-Based Access**: User roles include SaaS admin, organization manager, and team member.
- **Signup and Login**: Secure signup and login processes with JWT token handling.
- **Profile Management**: Users can view and manage their profiles.

### Organization Management
- **Organization Creation**: SaaS admins can create organizations.
- **User Association**: Users request to join existing organizations, which are approved by SaaS admins.
- **Industry Field Auto-Population**: The industry field in organization settings displays the current assigned industry.

### Subscription Management
- **Stripe Integration**: Subscription payments are processed via Stripe, and users are granted access upon successful payment.

### AI Chatbots
- **Dynamic Model Selection**: AI chatbot models are dynamically populated based on the selected provider, including up-to-date models from OpenAI.
- **Chatbot CRUD**: Users can create, edit, and delete chatbots within their organizations.

### Dashboard
- **Real-Time Data**: Active user data on the dashboard is updated in real-time.
- **Navigation Enhancements**: Users can view their profile and logout directly from the side navigation.

## Getting Started

### Requirements

Ensure you have the following technologies installed:

- **Node.js**: >= 14.x.x
- **npm**: >= 6.x.x
- **MongoDB**: A running instance of MongoDB

### Quickstart

1. **Clone the Repository**
   ```sh
   git clone <repository_url>
   cd project/
   ```

2. **Setup Environment Variables**
   Create a `.env` file with the required configuration settings. Refer to `.env.example` for necessary variables.

3. **Install Dependencies**
   ```sh
   # Install frontend dependencies
   cd client/
   npm install
   
   # Install backend dependencies
   cd ../server/
   npm install
   ```

4. **Run the Application**
   Use concurrently to start both frontend and backend simultaneously.
   ```sh
   npm run start
   ```

### License

The project is proprietary.

```
© 2024 SaaS Work. All rights reserved.
```