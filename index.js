const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const http = require("http");
const port = process.env.PORT || 5000;

//route import
const Router = require("./routes/Router");

require("dotenv").config();
const app = express();

//middle-wares
app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(cookieParser());
app.use(require("sanitize").middleware);

// using static files
app.use("/static", express.static(path.join(__dirname, "public")));

// API request limit
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all requests
app.use("/api/v1", apiLimiter);
app.use("/api/v1", Router);

app.get("/", (req, res) => {
    res.send("Welcome to MR. Xpert server");
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

const server = http.createServer(app);

// Include the socket server setup
const { initSocketServer } = require("./socketServer");
initSocketServer(server);

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
