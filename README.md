# SaaS Work

SaaS Work is a comprehensive SaaS platform designed to provide organizations with UK GDPR-compliant AI chatbots. Built using Vue.js and Tailwind CSS, the platform offers AI chatbot solutions that are dynamically updated with the latest models from providers like OpenAI. The primary goal is to deliver a professional and seamless user experience that encourages engagement from the first interaction, facilitated through detailed hero and pricing pages.

## Overview

SaaS Work is built with a dual-architecture approach, separating the frontend and backend to ensure modularity and ease of development.

### Architecture and Technologies

**Frontend:**
- **Framework:** Vue.js
- **Styling:** Tailwind CSS and shadcn-ui component library
- **Routing:** Client-side routing with `react-router-dom`
- **Development Tool:** Vite

**Backend:**
- **Framework:** Express
- **Database:** MongoDB with Mongoose
- **Authentication:** Token-based authentication using JWT

The frontend resides in the `client/` folder, utilizing Vite as the development server and running on port 5173. The backend, implemented with Express, is located in the `server/` folder and runs on port 3000. Both parts of the application can be started concurrently using the `npm run start` command.

## Features

- **Role-Based Access Control:** The platform supports role-based access with different permissions for SAAS admins, organization managers, and users.
- **AI Chatbots Management:** Users can create, edit, and delete chatbots, with conversation history and multi-thread support.
- **Subscription Management:** Integration with Stripe for subscription payments, allowing users and admins to manage subscriptions, view invoices, and handle payment statuses.
- **Real-Time Data:** The dashboard displays real-time active users, ensuring updated and relevant user activity data.
- **AI Model Integration:** Dynamic AI model options based on selected providers, regularly updated via API integration with OpenAI.
- **Secure Authentication:** Robust authentication and authorization mechanisms with JWT tokens, adhering to UK GDPR guidelines.

## Getting started

### Requirements

Ensure you have the following technologies installed on your computer:

- **Node.js** (>=14.x)
- **npm** (Node Package Manager)
- **MongoDB** (Database)

### Quickstart

1. **Clone the repository:**

   ```sh
   git clone <repository_url>
   cd saas-work
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

   This command will install all necessary dependencies in the root, client, and server folders.

3. **Configure environment variables:**

   Create a `.env` file in both the root, client, and server folders based on the provided `.env.example` file:

   ```sh
   cp .env.example .env
   ```

   Update the environment variables in the `.env` files with your MongoDB connection details and other necessary configurations.

4. **Start the application:**

   ```sh
   npm run start
   ```

   This command will start both the frontend and backend concurrently.

5. **Access the application:**

   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend: [http://localhost:3000](http://localhost:3000)

### License

The project is proprietary and not open source. 

```plaintext
Copyright (c) 2024.
```