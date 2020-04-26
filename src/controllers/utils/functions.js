const jwt = require("jsonwebtoken");
const authConfig = require("../../config/auth.json");

module.exports = {
  // 1: info que difere users. 2: hash MD5 unica da aplicação, 3: expiração
  generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
      expiresIn: 86400, // 1 dia
    });
  },
};
