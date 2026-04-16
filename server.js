const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");

const connectDB = require("./config/db");
const { seedInitialData } = require("./config/seedData");
const authRoutes = require("./routes/authRoutes");
const counterRoutes = require("./routes/counterRoutes");
const queueRoutes = require("./routes/queueRoutes");
const tokenRoutes = require("./routes/tokenRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (request, response) => {
  response.json({
    message: "Bank Token and Queue Management System API is running.",
  });
});

app.use("/api/token", tokenRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/counter", counterRoutes);

const startServer = async () => {
  await connectDB();
  await seedInitialData();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
