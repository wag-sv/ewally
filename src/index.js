require("dotenv").config();

const app = require("./server");

app.listen(Number(process.env.PORT), () =>
  console.log(`🚀 Server up and running at port ${process.env.PORT}.`)
);
