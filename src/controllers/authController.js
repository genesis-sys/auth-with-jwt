const { Router } = require("express");
const User = require("../models/User");

const routes = Router();

routes.post("/register", async (req, res) => {
  try {
    const user = await User.create(req.body);

    return res.send({ user });
  } catch (err) {
    return res.status(400).send({ error: "registration failed!" });
  }
});

module.exports = (app) => app.use("/auth", routes);
