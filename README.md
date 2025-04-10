```markdown
# SaaS Work

SaaS Work is a software as a service (SaaS) platform designed to provide UK GDPR-compliant AI chatbots to organizations. Built using Vue.js for the frontend and Tailwind CSS for styling, it incorporates a MongoDB database for data storage and Stripe for subscription management. The platform is role-based, ensuring robust access control and management functionalities. Organizations can be managed by SaaS admins, and users need to request to join these organizations. Pricing and subscription options are prominently featured to encourage user engagement.

## Overview

SaaS Work leverages modern web technologies and provides a clean, professional interface for users. The architecture includes:

* **Frontend:** 
  * Developed with React.js (in the `client/` folder) using Vite devserver.
  * Integrated with Shadcn-UI component library and Tailwind CSS.
  * Client-side routing managed by `react-router-dom`.
* **Backend:**
  * Built with Express and implementing REST API endpoints in the `server/` folder.
  * MongoDB database support through Mongoose.
  * Token-based authentication using JWT for secure user sessions.
  
The application is organized in two major parts:
1. **Frontend** - Running on port 5173, including key pages such as Home, Login, Register, Dashboard, and Administrator functionalities.
2. **Backend** - Running on port 3000, handling user authentication, chatbot management, organization management, and subscription services.

## Features

* **Role-Based Access Control:** Includes roles for Admin, Organization Manager, and Team Member.
* **AI Chatbots:** Creation, editing, deletion, and management of AI chatbots, including dynamic model population based on AI provider.
* **Subscription Management:** Users can manage their subscriptions, with subscriptions being mandatory for all except Admins. Stripe integration for payments.
* **User Registration:** Users need to join existing organizations upon signup, with a request system to be approved by SaaS admins.
* **Real-Time Data:** Active users panel shows real-time data on the dashboard.
* **Organization Management:** Admins can manage organizations, including industry specification and handling errors efficiently.
* **Profile Management:** Users can edit personal details and change passwords securely.
* **Error Handling:** Improved user-friendly error messages.

## Getting Started

### Requirements

Ensure you have the following installed:
* Node.js (v14.x or higher)
* npm (v6.x or higher)
* MongoDB

### Quickstart

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/saas-work.git
   cd saas-work
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set up the environment:**
   Create a `.env` file in the `server` directory and add the necessary configurations for MongoDB, JWT secrets, and Stripe.
   ```plaintext
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/yourdb
   JWT_SECRET=youraccesstokensecret
   JWT_REFRESH_SECRET=yourrefreshtokensecret
   STRIPE_SECRET_KEY=yourstripesecretkey
   ```

4. **Run the project:**
   ```sh
   npm run start
   ```

   This command starts both the frontend (on port 5173) and the backend (on port 3000) concurrently. You can access the app at `http://localhost:5173`.

### License

The project is proprietary and not open-source.

```
Copyright (c) 2024.
```