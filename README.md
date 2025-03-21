```markdown
# SaaS Work

SaaS Work is a comprehensive SaaS platform developed to provide UK GDPR-compliant AI chatbots to organizations. Utilizing Vue.js and Tailwind CSS for the front end, the platform employs a role-based access system and integrates Stripe for subscription management. The back end, built on Express and MongoDB, handles authentication, real-time updates, and API integrations with AI providers like OpenAI to fetch and display the latest AI models.

## Overview

SaaS Work is structured into two main parts: the front end and the back end.

**Frontend:**
- Built using Vue.js and Tailwind CSS.
- The client-side code resides in the `client/` folder.
- The `client/` folder is structured with components organized into `src/pages/` and `src/components/`.
- Client-side routing is managed by `react-router-dom`.
- Integrated with shadcn-ui component library.
- Runs on port 5173 for development.

**Backend:**
- Based on Express.js, implementing REST API endpoints located in `server/`.
- User authentication is done via email and password, using JWT tokens.
- Connects to a MongoDB database using Mongoose.
- Contains separate routes for various functionalities such as authentication, subscription management, and chatbot operations.
- Runs on port 3000.

## Features

- **GDPR-Compliant AI Chatbots**: Provides AI chatbot solutions compliant with UK GDPR guidelines.
- **Role-Based Access Control**: Admins manage organizations and approve user registrations.
- **Stripe Integration**: Manages subscriptions, payments, and invoices through Stripe.
- **Dynamic AI Model Display**: Fetches and displays AI models based on the selected AI provider.
- **Real-Time Data**: Tracks and displays active users in real time.
- **User and Admin Functionality**: Allows users to manage their subscriptions and admins to oversee user activities and subscriptions.
- **Profile Management**: Users can update their profiles and reset passwords.
- **Organization Management**: Admins can manage organizations, including editing and deleting them.

## Getting started

### Requirements

- Node.js (version 14 or higher)
- MongoDB
- NPM (version 6 or higher)

### Quickstart

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/saas-work.git
   cd saas-work
   ```

2. **Install dependencies:**
   ```bash
   npm install
   cd client
   npm install
   cd ../server
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in `server/` with the following content:
   ```plaintext
   PORT=3000
   DATABASE_URL=mongodb://localhost:27017/saaswork
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_jwt_refresh_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

4. **Run the application:**
   ```bash
   npm run start
   ```

   The client will be accessible at `http://localhost:5173` and the server at `http://localhost:3000`.

### License

The project is proprietary.  
Copyright (c) 2024.
```