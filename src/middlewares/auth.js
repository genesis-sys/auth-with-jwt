const jwt = require("jsonwebtoken");
const authConfig = require("../config/auth.json");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // caso não tenha um token
  if (!authHeader) return res.status(401).send({ error: "No token provided" });

  const parts = authHeader.split(" ");

  // caso não tenha duas parts:
  if (!parts.length === 2)
    return res.status(401).send({ error: "Token error" });

  const [scheme, token] = parts;

  // caso a primeira part não tenha a palavra 'Bearer'
  if (!/^Bearer$/i.test(scheme))
    return res.status(401).send({ error: "Token malfornated" });

  jwt.verify(token, authConfig.secret, (err, decoded) => {
    if (err) return res.status(401).send({ error: "Token inválid" });

    req.userId = decoded.id;

    return next();
  });
};

// decoded: tem as props que foi passado em  (params) ao gerar o token
