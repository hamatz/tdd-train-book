const express = require("express");
const todoRoutes = require("./routes/todo.routes");
const app = express();
const mongodb = require("./mongodb/mongodb.connecter");

mongodb.connect();

app.use(express.json());

app.use("/todo", todoRoutes);

module.exports = app;