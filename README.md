# SaaS Work

SaaS Work is a SaaS (Software as a Service) platform designed to provide UK GDPR compliant AI chatbots to organizations. Built using Vue.js and Tailwind CSS for the frontend and integrated with a MongoDB database, it ensures secure and efficient data handling. The platform's primary aim is to facilitate AI-powered customer interactions while maintaining strict adherence to GDPR guidelines.

## Overview

This project is structured into two main parts: the frontend and the backend.

1. **Frontend**: Developed using Vue.js with Tailwind CSS for styling, and integrated with the shadcn-ui component library. The frontend manages routing with react-router-dom and is organized under the `client/` directory, with pages and components broadly separated.
    - **Main Port**: 5173
    - **Key Folders**: `client/src/pages/`, `client/src/components/`

2. **Backend**: Built using Express.js, providing RESTful API endpoints aggregated under the `api/` directory. It handles user authentication, subscription management, and chatbot functionalities, utilizing MongoDB for data storage and retrieval.
    - **Main Port**: 3000
    - **Key Folders**: `server/routes/`, `server/models/`, `server/services/`

The application uses concurrently to run both the frontend and backend with a single npm command, ensuring a streamlined development process.

## Features

### General
- Professional hero page with comprehensive platform information and integrated pricing section, encouraging clear user engagement and streamlined registration.
- Role-based SaaS platform with roles including SAAS admin, organization manager, and team member.
- Organizations can be added exclusively by SAAS admins; users request to join existing organizations upon registration.
- Subscriptions managed through Stripe, with users redirected to payment upon registration and status updates synced with Stripe post-payment.
- Chatbot models populated based on selected AI providers (e.g., OpenAI), regularly updated for current offerings.
- Image analysis capabilities integrated with AI chatbots using large language models (LLMs).
- Real-time updates for active users, reflecting actual user activities.
- Management of user subscriptions, including views and actions concerning current subscriptions, suspension, and invoice access.
- Proper JWT token expiration and refresh handling to ensure secure and undisrupted sessions.

### Admin Features
- Manage organizations and users, including CRUD operations and user role reassignment.
- View and manage user subscriptions, changing statuses and viewing subscription details.
- Access to comprehensive logs, error handling, and improved error messaging for administrative actions.

### User Features
- Register and manage profiles, including password resetting and subscription management.
- Edit and delete AI chatbot settings and manage multiple conversation threads, retaining session contexts for more meaningful interactions.
- Update personal details and preferences conveniently from the user profile page.

## Getting Started

### Requirements

To run this project, ensure your computer has the following:
- Node.js (version 14.x or later)
- npm (version 6.x or later)
- MongoDB

### Quickstart

1. **Clone Repository**:
    ```sh
    git clone https://github.com/yourusername/saas-work.git
    ```

2. **Navigate to Project Directory**:
    ```sh
    cd saas-work
    ```

3. **Install Dependencies**:
    ```sh
    npm install
    ```

4. **Configure Environment Variables**:
    Create a `.env` file in the root directory. Based on the provided configuration snippets, it should look like:
    ```sh
    PORT=3000
    MONGODB_URI=mongodb://localhost:27017/yourdbname
    JWT_SECRET=yourjwtsecret
    JWT_REFRESH_SECRET=yourjwtrefreshsecret
    ```

5. **Run the Project**:
    ```sh
    npm run start
    ```

    Visit http://localhost:5173 for the frontend and http://localhost:3000/api for backend API endpoints.

### License

The project is proprietary. © 2024. All rights reserved.
