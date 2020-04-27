const mongoose = require("../../database");
const bcrypt = require("bcrypt");

/**
 * cria o schema do user para autenticação
 */

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  passwordResetToken: {
    type: String,
    default: "",
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    default: "",
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/*
 * antes de salvar encripta a senha
 * this: refere-se ao user
 */

UserSchema.pre("save", async function (next) {
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;

  next();
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
