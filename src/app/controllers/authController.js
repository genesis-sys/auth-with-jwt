const { Router } = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const User = require("../models/User");
const mailer = require("../../modules/mailer");

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

routes.post("/forgot_password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(401).send({ error: "User not found!" });

    const token = crypto.randomBytes(20).toString("hex");

    // add 1 hora para expirar o token
    const now = new Date();
    now.setHours(now.getHours() + 1);

    await User.findOneAndUpdate(user.id, {
      $set: {
        passwordResetToken: token,
        passwordResetExpires: now,
      },
    });

    mailer.sendMail(
      {
        to: email,
        from: "genisys.oficial@gmail.com",
        template: "auth/forgot_password",
        context: { token },
      },
      (err) => {
        if (err) {
          return res
            .status(400)
            .send({ error: "cannot send forgot password email" });
        }

        return res.send();
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(400).send({ err: "Error on forgot password, try again" });
  }
});

routes.post("/reset_password", async (req, res) => {
  const { email, token, password } = req.body;

  try {
    const user = await User.findOne({ email }).select(
      `+passwordResetToken passwordResetExpires`
    );

    // caso o email não é cadastrado
    if (!user) return res.status(400).send({ error: "User not found" });

    // caso o token estiver incorreto
    if (token !== user.passwordResetToken)
      return res.status(400).send({ error: "Token Invalid" });

    const now = new Date();

    // caso o token passou da data: (+1 hora)
    if (now > user.passwordResetExpires) {
      return res
        .status(400)
        .send({ error: "Token expired, generate a new one" });
    }

    user.password = password;

    await user.save();
    return res.send();
  } catch (err) {
    return res.status(400).send({ error: "Cannot reset password, try again" });
  }
});

module.exports = (app) => app.use("/auth", routes);
