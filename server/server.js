const express = require("express");
const app = express();
const cors = require("cors");

//API
require('./routes/conn');
const router = require('./routes/login');
const ticketRoutes = require("./routes/ticket");
const batchRoutes = require("./routes/batch");
const resetRoutes = require("./routes/reset");


const corsOptions = {
  origin: ["http://localhost:5173"],
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(router);
app.use(ticketRoutes);
app.use(batchRoutes);
app.use(resetRoutes);

app.use('/uploads', express.static('./uploads'));

app.listen(8080, () => {
  console.log("Server started on port 8080");
});

