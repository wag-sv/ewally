require("dotenv").config();

const express = require("express");
const app = express();
app.use(express.json());

const cors = require("cors");
app.use(cors({ origin: process.env.CLIENT }));

const routes = require("../routes/routes");
app.use("/", routes);

app.listen(Number(process.env.PORT), () =>
  console.log(`🚀 Server up and running at port ${process.env.PORT}.`)
);
