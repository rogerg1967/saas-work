# SaaS Work

"SaaS Work" is a SaaS platform designed to provide UK GDPR compliant AI chatbots to organizations using Vue.js, Tailwind CSS, and a MongoDB database. The platform offers a detailed and professional hero page, role-based access control, dynamic AI chatbot integration, subscription management via Stripe, and a rich set of admin and user functionality.

## Overview

The architecture leverages a robust stack with front-end rendered by React.js and Backend powered by Node.js and Express. This project uses Vue.js for component-centric development and Tailwind CSS for efficient styling. MongoDB serves as the primary database, enabling flexible, schema-less data management.

### Project Structure
The project consists of two main parts:

1. **Frontend**
   - Located in the `client/` directory.
   - Built with React.js with Vite as the dev server.
   - Uses Tailwind CSS for styling and shadcn-ui component library.
   - Client-side routing is implemented using `react-router-dom`.

2. **Backend**
   - Located in the `server/` directory.
   - Built with Node.js and Express framework.
   - Uses MongoDB with Mongoose for database operations.
   - Implements REST API endpoints.

**Directory Structure:**
```
saas-work/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── styles/
│   │   ├── index.css
│   │   ├── main.tsx
│   └── package.json
├── server/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── services/
│   ├── utils/
│   ├── config/
│   └── .env
└── README.md
```

## Features

- **Hero Page**: Detailed landing page with comprehensive information about the platform's offerings, and a prominently featured pricing section leading to the registration process.
- **Role-Based Access Control**: Different roles like SaaS Admin, Organization Manager, and Team Member with restricted access based on roles.
- **Organization Management**: Only SaaS Admins can create organizations; users request to join existing organizations.
- **Subscription Management**: Users must subscribe via Stripe before accessing the application.
- **AI Chatbot Management**: Dynamic AI chatbot integration based on selected AI provider, including the latest OpenAI models.
- **Real-time Data**: Real-time data display for active users and chatbot messages.
- **User and Organization Management**: Interface to manage users and organizations, including CRUD operations, via admin roles.
- **Profile Management**: Users can update personal details and reset passwords.

## Getting Started

### Requirements

Ensure you have the following installed:
- Node.js (v16+)
- npm (v7+)
- MongoDB (v4.4+)
- Stripe account for payment processing

### Quickstart

Follow these steps to set up and run the project locally:

1. **Clone the Repository**:
    ```sh
    git clone <repository-url>
    cd saas-work
    ```

2. **Setup Environment Variables**:
   - Copy `.env.example` to `.env` in the `server/` directory and configure the necessary environment variables like `DATABASE_URL` and `STRIPE_SECRET_KEY`.

3. **Install Dependencies**:
    ```sh
    # In the root directory
    npm install

    # Navigate to client and install packages
    cd client
    npm install

    # Navigate to server and install packages
    cd ../server
    npm install
    ```

4. **Start Development Servers**:
    In the root directory, run concurrently:
    ```sh
    npm run start
    ```

5. **Seed the Database** (optional for initial setup to have sample data):
    ```sh
    cd server
    npm run seed
    ```

6. **Open Your Browser**:
    Access the application at `http://localhost:5173/`.

### License

The project is proprietary (not open source).

```plaintext
Copyright (c) 2024.
```