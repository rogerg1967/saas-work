# SaaS Work

A SaaS platform built to provide UK GDPR-compliant AI chatbots to organizations, utilizing Vue.js and Tailwind CSS for the frontend, with a robust backend powered by Express and MongoDB. This platform ensures detailed offerings and pricing, managed by role-based access controls, ensuring seamless user subscription management via Stripe.

## Overview

"SaaS Work" is a sophisticated application designed with a focus on aligning with regulatory standards and providing a professional, user-friendly experience. The architecture consists of a frontend powered by React and Vite, and a backend built using Express.js, connected to a MongoDB database. The project leverages modern development practices including component-based UI managed with Shadcn UI, and strict role-based access control.

### Project Structure

The project is divided into two main parts:

1. **Frontend (`client/`)**:
   - **ReactJS**: Built using React, served by Vite.
   - **Styling**: Integrated with Tailwind CSS and Shadcn-ui component library.
   - **API Requests**: Handled in `client/src/api/`.
   - **Routing**: Managed by `react-router-dom`.
   - **Dev Server**: Runs on port 5173.

2. **Backend (`server/`)**:
   - **Express**: Implements REST API endpoints.
   - **Database**: Connected to MongoDB using Mongoose.
   - **Authentication**: JWT-based token authentication (access and refresh tokens).
   - **Dev Server**: Runs on port 3000.

Concurrently is used to run both client and server together with a single command (`npm run start`).

## Features

- **Role-Based Access Control**:
  - **SaaS Admin**: Manage organizations and users.
  - **Organization Manager**: Manage chatbots within their organization.
  - **Team Member**: Limited user access, typically chats and views data.
  
- **Comprehensive Hero Page**:
  - Highlights platform features.
  - Directs users to an informative pricing section leading to registration and subscription.

- **User and Subscription Management**:
  - Users request to join existing organizations.
  - Subscription management via Stripe, with roles exempting certain users from payment (e.g., admins).
  - Seamless redirects post-payment, directly integrating Stripe status updates.

- **AI Chatbot Features**:
  - Dynamic AI model fetch based on selected AI provider.
  - Chatbot creation, updating, and deletion from the UI.
  
- **Real-Time Data Management**:
  - Active users' data displayed in real-time on the dashboard.

- **User Experience Enhancements**:
  - Editable profile details, password resets.
  - Side navigation with user profile access and logout options.

## Getting Started

### Requirements

To run the "SaaS Work" project, ensure the following software is installed on your machine:

- **Node.js** (>= 14.x)
- **npm** (>= 6.x)
- **MongoDB** (Local or Cloud instance)

### Quickstart

1. **Clone the repository**:
   ```sh
   git clone <repository-url>
   ```

2. **Install dependencies**:
   ```sh
   cd SaaS-Work
   npm install
   cd client
   npm install
   cd ../server
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in both `client/` and `server/` directories with the necessary configuration (refer to `.env.example` for guidance).

4. **Run the application**:
   ```sh
   npm start
   ```

5. **Access the application**:
   - **Frontend**: `http://localhost:5173`
   - **Backend**: `http://localhost:3000`

### License

The project is proprietary (not open source), Copyright (c) 2024.
