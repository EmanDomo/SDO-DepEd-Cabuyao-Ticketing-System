const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

//API
require('./routes/conn');
const router = require('./routes/login');
const ticketRoutes = require("./routes/ticket");
const batchRoutes = require("./routes/batch");
const resetRoutes = require("./routes/reset");
const depedRoutes = require("./routes/depedacc");


const corsOptions = {
  origin: ["http://localhost:5173"],
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(router);
app.use(ticketRoutes);
app.use(batchRoutes);
app.use(resetRoutes);
app.use(depedRoutes);

app.use('/uploads', express.static('./uploads'));
app.use("/deped_uploads", express.static(path.join(__dirname, "deped_uploads")));

app.listen(8080, () => {
  console.log("Server started on port 8080");
});

