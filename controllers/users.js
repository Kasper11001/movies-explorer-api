const { NODE_ENV, JWT_SECRET = 'secret-key' } = process.env;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const ConflictError = require('../errors/conflict-error');

module.exports.getUserInfo = (req, res, next) => {
  const currentUserId = req.user._id;

  User.findById(currentUserId)
    .orFail(() => next(new NotFoundError('Пользователь по указанному _id не найден.')))
    .then((user) => res.send({ data: user }))
    .catch(next);
};

module.exports.updateProfileInfo = (req, res, next) => {
  const currentUserId = req.user._id;
  const { name, email } = req.body;

  User.findById(currentUserId)
    .then((user) => {
      if (email !== user.email) {
        next(new ConflictError('Передан некорректный Email при обновлении профиля.'));
      } else {
        User.findByIdAndUpdate(
          currentUserId,
          { name, email },
          {
            new: true, // обработчик then получит на вход обновлённую запись
            runValidators: true, // данные будут валидированы перед изменением
          },
        )
          .orFail(() => next(new NotFoundError('Пользователь по указанному _id не найден.')))
          .then((correctUser) => res.send({ data: correctUser }))
          .catch((err) => {
            if (err.name === 'ValidationError') {
              next(new BadRequestError('Переданы некорректные данные при обновлении профиля.'));
            } else {
              next(err);
            }
          });
      }
    }).catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    email,
    password,
    name,
  } = req.body;

  if (!email || !password) {
    next(new BadRequestError('Email и password не могут быть пустыми.'));
  }

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
    }))
    .then((user) => {
      const newUser = user.toObject();
      delete newUser.password;
      res.send({ data: newUser });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при создании пользователя.'));
      } else if (err.code === 11000) {
        next(new ConflictError('Такой пользователь уже существует.'));
      } else {
        next(err);
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'secret-key', { expiresIn: '7d' });

      res.cookie('jwt', token, {
        maxAge: 3600000,
        httpOnly: true,
      });

      res.send({ message: 'loggedIn' });
      res.end();
    })
    .catch(next);
};

module.exports.logOut = (req, res) => {
  res.cookie('jwt', {
    maxAge: 0,
    httpOnly: true,
  });
  res.send({ message: 'loggedOut' });
  res.end();
};
