const { Router } = require("express");
const bcrypt = require("bcrypt");

const User = require("../models/User");
const { generateToken } = require("./utils/functions");

const routes = Router();

routes.post("/register", async (req, res) => {
  const { email } = req.body;
  try {
    if (await User.findOne({ email }))
      return res.status(400).send({ error: "User already exists" });

    const user = await User.create(req.body);

    user.password = undefined;

    return res.send({ user, token: generateToken({ id: user._id }) });
  } catch (err) {
    return res.status(400).send({ error: "registration failed!" });
  }
});

routes.post("/authenticate", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) return res.status(400).send({ error: "User not found!" });

  // vai comparar se o psw digitado é igual que está no DB (encriptado)
  if (!(await bcrypt.compare(password, user.password)))
    return res.status(400).send({ errpr: "Invalid password!" });

  user.password = undefined;

  return res.send({ user, token: generateToken({ id: user._id }) });
});

module.exports = (app) => app.use("/auth", routes);
