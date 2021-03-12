import mongoose from 'mongoose';
import enviarEmailRecovery from '../helpers/email-recovery';

const Usuario = mongoose.model('Usuario');

class UsuarioController {
  index(req, res, next) {
    Usuario.findById(req.payload.id)
      .then((usuario) => {
        if (!usuario)
          return res.status(401).json({ errors: 'Usuario não registrado' });
        return res.json({ usuario: usuario.enviarAhthJSON() });
      })
      .catch(next);
  }

  show(req, res, next) {
    Usuario.findById(req.params.id)
      .populate({ path: 'loja' })
      .then((usuario) => {
        if (!usuario)
          return res.status(401).json({ errors: 'Usuario não registrado' });
        return res.json({
          usuario: {
            name: usuario.name,
            email: usuario.email,
            permissao: usuario.permissao,
            loja: usuario.loja,
          },
        });
      })
      .catch(next);
  }

  store(req, res, next) {
    const { name, email, password } = req.body;
    const usuario = new Usuario({ name, email, password });
    usuario.setSenha(password);
    usuario
      .save()
      .then(() => res.json({ usuario: usuario.enviarAhthJSON() }))
      .catch(next);
  }

  update(req, res, next) {
    const { name, email, password } = req.body;
    Usuario.findById(req.payload.id)
      .then((usuario) => {
        if (!usuario)
          return res.status(401).json({ errors: 'Usuario não registrado ' });
        if (typeof name !== 'undefined') usuario.name = name;
        if (typeof email !== 'undefined') usuario.email = email;
        if (typeof password !== 'undefined') usuario.setSenha(password);

        return usuario
          .save()
          .then(() => {
            return res.json({ usuario: usuario.enviarAhthJSON() });
          })
          .catch(next);
      })
      .catch(next);
  }

  remove(req, res, next) {
    Usuario.findById(req.payload.id)
      .then((usuario) => {
        if (!usuario)
          return res.status(401).json({ errors: 'Usuario não registrado ' });
        return usuario
          .remove()
          .then(() => {
            return res.json({ deletado: true });
          })
          .catch(next);
      })
      .catch(next);
  }

  login(req, res, next) {
    const { email, password } = req.body;
    if (!email)
      return res
        .status(422)
        .json({ errors: { email: 'não pode ficar vazio' } });
    if (!password)
      return res
        .status(422)
        .json({ errors: { password: 'não pode ficar vazio' } });
    Usuario.findOne({ email })
      .then((usuario) => {
        if (!usuario)
          return res.status(401).json({ errors: 'Usuario não registrado ' });
        if (!usuario.validarSenha())
          return res.status(401).json({ errors: 'Senha inválida' });
        return res.json({ usuario: usuario.enviarAhthJSON() });
      })
      .catch(next);
  }

  //RECOVERY

  showRecovery(req, res, next) {
    return res.render('recovery', { error: null, success: null });
  }

  createRecovery(req, res, next) {
    const { email } = req.body;
    if (!email)
      return res.render('recovery', {
        error: 'Preencha com seu email',
        success: null,
      });

    Usuario.findOne({ email })
      .then((usuario) => {
        if (!usuario)
          return res.render('recovery', {
            error: 'Não existe usúario com este email',
            success: true,
          });
        const recoveryData = usuario.criarTokenRecuperacaoSenha();
        return usuario
          .save()
          .then(() => {
            return res.render('recovery', { error: null, success: true });
          })
          .catch(next);
      })
      .catch(next);
  }

  showCompleteRecovery(req, res, next) {
    if (!req.query.token)
      return res.render('recovery', {
        error: 'Token não identificado',
        success: null,
      });
    Usuario.findOne({ 'recovery.token': req.query.token })
      .then((usuario) => {
        if (!usuario)
          return res.render('recovery', {
            error: 'Não existe usúario com este token',
            success: null,
          });
        if (new Date(usuario.recovery.date) < new Date())
          return res.render('recovery', {
            error: 'Token expirado. Tente novamente',
            success: null,
          });
        return res.render('recovery/store', {
          error: null,
          success: null,
          token: req.query.token,
        });
      })
      .catch(next);
  }
}
