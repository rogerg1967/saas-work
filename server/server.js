// Load environment variables
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const path = require('path');
const fs = require('fs');
const basicRoutes = require("./routes/index");
const authRoutes = require("./routes/authRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const stripeWebhooks = require("./routes/stripeWebhooks");
const organizationRoutes = require('./routes/organizationRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const teamRoutes = require('./routes/teamRoutes');
const adminRoutes = require('./routes/adminRoutes');
const llmRoutes = require('./routes/llmRoutes');
const activeUserRoutes = require('./routes/activeUserRoutes');
const industryRoutes = require('./routes/industryRoutes');
const threadRoutes = require('./routes/threadRoutes');
const { connectDB } = require("./config/database");
const cors = require("cors");

if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL variables in .env missing.");
  process.exit(-1);
}

const app = express();
const port = process.env.PORT || 3000;
// Pretty-print JSON responses
app.enable('json spaces');
// We want to be consistent with URL paths, so we enable strict routing
app.enable('strict routing');

app.use(cors({}));

// Register webhook routes BEFORE bodyParser middleware
app.use('/api/stripe/webhook', stripeWebhooks);

// Regular parsers for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
connectDB();

app.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
  console.error(error.stack);
});

// Basic Routes
app.use(basicRoutes);
// Authentication Routes
app.use('/api/auth', authRoutes);
// Subscription Routes
app.use('/api/subscription', subscriptionRoutes);
// Stripe Webhook Routes
app.use('/api/stripe', stripeWebhooks);
// Organization Routes
app.use('/api/organizations', organizationRoutes);
// Chatbot Routes
app.use('/api/chatbots', chatbotRoutes);
// Messages Routes
app.use('/api/messages', llmRoutes);
// Team Routes
app.use('/api/team', teamRoutes);
// Admin Routes
app.use('/api/admin', adminRoutes);
// LLM Routes
app.use('/api/llm', llmRoutes);
// Active User Routes
app.use('/api/active-users', activeUserRoutes);
// Industry Routes
app.use('/api/industries', industryRoutes);
// Thread Routes
app.use('/api/threads', threadRoutes);

// If no routes handled the request, it's a 404
app.use((req, res, next) => {
  res.status(404).send("Page not found.");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  res.status(500).send("There was an error serving your request.");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});