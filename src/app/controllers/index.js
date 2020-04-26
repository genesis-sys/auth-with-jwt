/**
 * Retorna todos os controllers passando o app para eles
 */

const fs = require("fs");
const path = require("path");

module.exports = (app) => {
  fs.readdirSync(__dirname)
    .filter(
      (file) =>
        file.indexOf(".") !== 0 && file !== "index.js" && file !== "utils"
    )
    .forEach((file) => require(path.resolve(__dirname, file))(app));
};

// projectController(app)
// authController(app)
