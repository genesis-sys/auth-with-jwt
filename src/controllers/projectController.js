const { Router } = require("express");

const authMidleware = require("../middlewares/auth");

const router = Router();

// verifica se está logado para acessar essa rota
router.use(authMidleware);

router.get("/", (req, res) => {
  return res.send({ ok: true });
});

module.exports = (app) => app.use("/projects", router);
