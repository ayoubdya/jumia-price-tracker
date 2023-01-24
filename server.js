if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const path = require("path");
const express = require("express");
const app = express();
const morgan = require("morgan");
const apiRouter = require("./routes/api");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");

mongoose.set("strictQuery", false);
mongoose.connect(process.env.URI, { useNewUrlParser: true });
const db = mongoose.connection;
db.once("open", () => console.log("connected to the database!"));

app.use(cors());
// app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", apiRouter);

if (process.env.NODE_ENV === "production") {
  console.log("production server");
  app.use(express.static(path.join(__dirname, "./client/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
}

app.listen(process.env.PORT || 3333, () =>
  console.log(`listening at http://localhost:${process.env.PORT}`)
);
