import mongoose from 'mongoose';
Schema = mongoose.Schema;
import uniqueValidator from 'mongoose-unique-validator';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
const secret = require('../config').secret;

const UsuarioSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Não pode ser vazio'],
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, 'Não pode ser vazio'],
      index: true,
      match: [/\S+@\S+\.\S+/, 'é inválido'],
    },
    loja: {
      type: Schema.Types.ObjectId,
      ref: 'Loja',
      required: [true, 'Não pode ser vazio'],
    },
    permissao: {
      type: Array,
      default: ['cliente'],
    },
    hash: String,
    salt: String,
    recovery: {
      type: {
        token: String,
        date: Date,
      },
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

UsuarioSchema.plugin(uniqueValidator, { message: 'já está sendo utilizado' });

UsuarioSchema.method.setSenha = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(
    password,
    this.salt,
    10000,
    512,
    'sha512'.toString('hex')
  );
};

UsuarioSchema.methods.validarSenha = function (password) {
  const hash = crypto.pbkdf2Sync(
    password,
    this.salt,
    10000,
    512,
    'sha512'.toString('hex')
  );
  return hash === this.hash;
};

UsuarioSchema.methods.gerarToken = function () {
  const today = new Date();
  const exp = new Date(today);
  exp.setDate(today.getDate() + 15);

  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      name: this.name,
      exp: parseFloat(exp.getTime() / 1000, 10),
    },
    secret
  );
};

UsuarioSchema.methods.enviarAuthJSON = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    loja: this.loja,
    role: this.permissao,
    token: this.gerarToken(),
  };
};

UsuarioSchema.methods.criarTokenRecuperacaoSenha = function () {
  this.recovery = {};
  this.recovery.token = crypto.randomBytes(16).toString('hex');
  this.recovery.date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
  return this.recovery;
};

UsuarioSchema.methods.finalizarTokenRecuperacaoSenha = function() {
  this.recovery = { token: null, date: null };
  return this.recovery;
};

module.exports = mongoose.model('Usuario', UsuarioSchema);
