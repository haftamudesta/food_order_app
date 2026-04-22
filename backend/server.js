// Load environment variables
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

const app = require("./app");
const connectDB = require("./DBConnection");

// Start the server

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(process.env.PORT, () => {
      console.log(`✅ Server is running on port: ${process.env.PORT}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error.message);
      process.exit(1);
    });

  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  server.close(() => {
    process.exit(1);
  });
});

startServer();