```markdown
# SaaS Work

SaaS Work is a SaaS platform built using Vue.js and Tailwind CSS geared toward providing UK GDPR-compliant AI chatbots to organizations. It features role-based access, where only a SaaS admin can add organizations, and users must request to join existing organizations. Users are required to complete a subscription payment using Stripe before accessing the application. The platform dynamically integrates AI chatbot models based on the selected AI provider through real-time API integrations.

## Overview

SaaS Work leverages a modern tech stack for both the frontend and backend, utilizing:
- **Frontend**: Vue.js with Tailwind CSS, organized using Vite and shadcn-ui component library.
- **Backend**: Express-based server with REST API endpoints and MongoDB with Mongoose for data storage.
- **Authentication**: Token-based authentication using bearer access and refresh tokens.
- **Payment Integration**: Subscription payments managed through Stripe.
- **AI Integration**: Dynamic AI chatbot models fetched from OpenAI and other providers via API.

The project is structured as follows:

### Frontend (client/)
- `client/src/pages`: Main pages such as Home, Login, Register, Dashboard, etc.
- `client/src/components`: UI components used by pages.
- `client/src/api`: API request files mocking server responses, structured with descriptions, endpoints, requests, and responses.

### Backend (server/)
- `server/api`: REST API endpoints for authentication, subscriptions, and CRUD operations.
- `server/models`: Mongoose schemas for Chatbot, Organization, User, Message, and LLMSettings.
- `server/routes`: Higher-level route definitions for various endpoints.
- `server/services`: Business logic for each model, handling complex operations.
- `server/middleware`: Authentication and subscription validation middleware.

## Features

The SaaS Work platform includes:
1. **Role-Based Access Control**: SaaS admins manage organizations and users who must request to join organizations.
2. **GDPR Compliance**: Compliant with UK GDPR for data protection.
3. **Subscription Management**: Users must subscribe via Stripe payment integration before accessing the platform.
4. **Dynamic AI Chatbots**: Real-time updated AI models from providers like OpenAI.
5. **Admin Dashboard**: Allows admins to manage organizations, users, and chatbots.
6. **User Dashboard**: Provides functionality for users to interact with chatbots and other users within their organization.

## Getting started

### Requirements

To run the project, ensure you have the following installed on your development machine:
- Node.js (v14 or later)
- NPM (v6 or later)
- MongoDB (locally or through a managed service)
- Stripe account for managing subscription payments

### Quickstart

1. **Clone the repository**:
    ```sh
    git clone [repository-url]
    cd [repository-url]
    ```

2. **Set up environment variables**:
    Create a `.env` file in the `server/` folder with the following values:
    ```env
    PORT=3000
    DATABASE_URL=mongodb://localhost/saasworks
    ACCESS_TOKEN_SECRET=your_access_token_secret
    REFRESH_TOKEN_SECRET=your_refresh_token_secret
    STRIPE_SECRET_KEY=your_stripe_secret_key
    ```

3. **Install dependencies**:
    In the project root, run the following commands:
    ```sh
    npm install
    ```

4. **Start the development server**:
    Use the concurrently command to run both client and server:
    ```sh
    npm run start
    ```

### License

The project is proprietary. Copyright (c) 2024.
```