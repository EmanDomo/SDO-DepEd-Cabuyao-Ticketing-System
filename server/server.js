const express = require("express");
require('./routes/conn');
const app = express();
const cors = require("cors");
const router = require('./routes/login');
const ticketRoutes = require("./routes/tickets");
const corsOptions = {
  origin: ["http://localhost:5173"],
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(router);
app.use(ticketRoutes);

app.use('/uploads', express.static('./uploads'));

app.listen(8080, () => {
  console.log("Server started on port 8080");
});

