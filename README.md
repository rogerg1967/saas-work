# SaaS Work

SaaS Work is a Software-as-a-Service (SaaS) platform designed to provide UK GDPR compliant AI chatbots to organizations. The platform is built using Vue.js and Tailwind CSS for the frontend, with a Node.js and Express backend, and MongoDB for data storage. The primary objective is to offer dynamic AI chatbot solutions, with a focus on security, scalability, and user engagement.

## Overview

SaaS Work utilizes a modern tech stack including React, Tailwind CSS, Node.js, Express, and MongoDB. The project is structured into two main parts: the frontend and the backend.

### Architecture and Technologies

- **Frontend**: 
  - Built with React and Vite.
  - Tailwind CSS for styling.
  - Shadcn-ui component library.
  - `react-router-dom` for routing.
  - The frontend runs on port 5173.

- **Backend**: 
  - Developed with Node.js and Express.
  - MongoDB for database with Mongoose as the ODM.
  - REST API endpoints for interfacing with frontend.
  - The backend runs on port 3000.

### Project Structure

- **client/**: Contains all frontend code.
  - **src/**: Main source code folder.
  - **components/**: Reusable React components.
  - **pages/**: Page components for different routes.
  - **api/**: API request functions with mocked data.

- **server/**: Contains all backend code.
  - **routes/**: Defines Express routes for various functionalities.
  - **models/**: Mongoose schemas and models.
  - **services/**: Business logic and service functions.

## Features

- **Comprehensive Hero Page**: Provides detailed information about the platform, with a prominent pricing section leading to the registration page.
- **Role-Based Access**: Includes roles such as SaaS Admins, Organization Managers, and Team Members. Organizations can only be added by SaaS admins.
- **Registration and Subscription**: Users must request to join an existing organization and complete a subscription payment via Stripe, with admins exempted from subscription requirements.
- **Dynamic AI Chatbots**: Integrates with AI providers like OpenAI, offering real-time updates of available models.
- **Chatbot Management**: Users can edit and delete chatbots, with a responsive UI for managing chatbot settings.
- **Active Users Tracking**: Real-time display of active users on the dashboard.
- **User and Subscription Management**: Allows both users and admins to manage subscriptions, including viewing details and suspending services.
- **User Profile Management**: Users can edit personal details and reset passwords.
- **Enhanced Navigation**: Side navigation displays current user information and includes logout functionality.

## Getting Started

### Requirements

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (v4.0 or higher)

### Quickstart

1. **Clone the repository**:
    ```bash
    git clone https://github.com/your-repo/saas-work.git
    cd saas-work
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Set up environment variables**:
    - Create a `.env` file in both root, `client/`, and `server/` directories.
    - Copy the content from `.env.example` (if available) or define the necessary environment variables for MongoDB connection, Stripe configuration, and JWT secrets.

4. **Run the development server**:
    ```bash
    npm run start
    ```

5. **Access the application**:
    - Frontend: [http://localhost:5173](http://localhost:5173)
    - Backend: [http://localhost:3000](http://localhost:3000)

### License

The project is proprietary (not open source).

```
Copyright (c) 2024.
```