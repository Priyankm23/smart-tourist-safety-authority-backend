const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const connectDB = require('./config/dbConnection');
const { PORT ,NODE_ENV} = require("./config/config")
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middlewares/authMiddleware");
const cors = require("cors");


const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // replace with your frontend origin
  credentials: true,
}));

// Routes
app.use("/api/auth", authRoutes);

// Example protected routes
app.get("/admin-only", authMiddleware(["Admin"]), (req, res) => {
  res.json({ message: `Welcome Admin ${req.user.id}` });
});

app.get("/police-only", authMiddleware(["Police Officer"]), (req, res) => {
  res.json({ message: `Welcome Police Officer ${req.user.id}` });
});

app.get("/all-authorities", authMiddleware(), (req, res) => {
  res.json({ message: `Hello ${req.user.role}` });
});

// Start server
app.listen(PORT, async() => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
  await connectDB();
});
