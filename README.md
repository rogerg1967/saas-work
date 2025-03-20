# SaaS Work

SaaS Work is a platform designed to provide UK GDPR compliant AI chatbots to organisations. It leverages the power of VueJS and Tailwind CSS for its frontend, and includes a robust backend with REST API endpoints, MongoDB for data storage, and Stripe for managing subscription payments.

## Overview

SaaS Work is built with a modern tech stack encompassing a VueJS frontend styled with Tailwind CSS, and an ExpressJS backend. It is designed to ensure that organisations can deploy GDPR-compliant AI chatbots easily while managing users, subscriptions, and organisations efficiently.

### Architecture and Technologies
- **Frontend**:
  - **VueJS**: JavaScript framework for building interactive user interfaces.
  - **Tailwind CSS**: Utility-first CSS framework for styling.
  - **Client Folder Structure**:
    - `client/src/pages/`: Contains the main page components.
    - `client/src/components/`: Reusable components.
    - `client/src/api/`: Centralized API request files.
    - `vite.config.ts`: Vite build tool configuration for development and production environments.

- **Backend**:
  - **Express**: A web application framework for Node.js.
  - **REST API**: Implements endpoints for various functionalities such as authentication, user management, organisation management, and AI chatbot operations.
  - **MongoDB**: Document-oriented database for storing user, chatbot, and organisational data.
  - **Mongoose**: ORM for MongoDB.
  - **Token-based Authentication**: Access and refresh tokens for user session management.
  - **Stripe**: Payment processing.

### Project Structure

- `client/`: Contains the frontend code:
  - `components/`: Reusable UI components using Shadcn UI.
  - `pages/`: Page components like Home, Login, Register, Dashboard, etc.
  - `api/`: Files that define API requests and manage mocked data during development.
  - `styles/`: Tailwind CSS configurations and global styles.
- `server/`: Contains the backend code:
  - `routes/`: API endpoint definitions and middleware for handling authentication and authorization.
  - `models/`: Mongoose schemas for data models like User, Organization, Chatbot, etc.
  - `services/`: Business logic encapsulated in service classes.
  - `utils/`: Utility functions for authentication and password management.
- `package.json`: Configuration and dependencies for the project.

## Features

- **Role-based Access Control**: Different roles including Admin, Organisation Manager, and Team Member.
- **GDPR Compliant AI Chatbots**: Only admins can add organisations, users request to join existing organisations.
- **User Registration and Authentication**: Secure registration and login with token-based authentication.
- **Subscription Management via Stripe**: Users must make a subscription payment to gain access.
- **Dynamic AI Model Selection**: Choose from latest AI models based on the selected AI provider.
- **Real-time Data Updates**: Displays active users and their activities in real-time.
- **CRUD Operations for Users and Chatbots**: Admin functionalities to create, edit, and delete users and chatbots.
- **Error Handling**: User-friendly error messages and validation feedback.

## Getting started

### Requirements

To run SaaS Work, you'll need the following installed on your computer:
- **Node.js** (>=14.x)
- **npm** (Node Package Manager, comes with Node.js)
- **MongoDB** (Database)

### Quickstart

Following these steps will set up and run the project locally:

1. **Clone the Repository**:
   ```sh
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install Dependencies**:
   ```
   npm install
   cd client
   npm install
   cd ../server
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in both the `client` and `server` directories and add the necessary configuration as specified in the `.env.example` files.

4. **Start MongoDB**:
   Ensure you have a MongoDB instance running. You can start one locally with:
   ```sh
   mongod
   ```

5. **Run the Project**:
   Run the following command from the root directory to start both the client and server:
   ```sh
   npm run start
   ```

6. **Access the Application**:
   Open your browser and navigate to `http://localhost:5173` to access the frontend.

### License

The project is proprietary. All rights reserved.

```text
Copyright (c) 2024.
```