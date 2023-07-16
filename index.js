const express = require("express");
const cors = require("cors");
const path = require("path");
const port = process.env.PORT || 5000;

//route import
const Router = require("./routes/Router");

require("dotenv").config();
const app = express();

//middle-wares
app.use(cors());
app.use(require("sanitize").middleware);
app.use(express.json());
// using static files 
app.use('/static', express.static(path.join(__dirname, 'public')))
app.use("/api/v1", Router);


app.get("/", (req, res) => {
    res.send("Welcome to MR. Xpert server");
});

app.listen(port, () => {
    console.log(`listening at ${port}`);
});
