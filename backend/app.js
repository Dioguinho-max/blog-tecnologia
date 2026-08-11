require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const postRoutes = require("./routes/postRoutes");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const seoRoutes = require("./routes/seoRoutes");
const readerRoutes = require("./routes/readerRoutes");
const commentRoutes = require("./routes/commentRoutes");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

const app = express();
app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL?.split(",") || true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "..")));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/seo", seoRoutes);
app.use("/api/reader", readerRoutes);
app.use("/api/comments", commentRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
