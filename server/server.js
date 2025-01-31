const express = require("express");
require('./routes/conn');
const app = express();
const cors = require("cors");
const router = require('./routes/login');
const corsOptions = {
  origin: ["http://localhost:5173"],
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(router);

app.get("/api", (req, res) => {
  res.json({ fruits: ["apple", "strawberry", "pineapple"] });
});

app.listen(8080, () => {
  console.log("Server started on port 8080");
});

