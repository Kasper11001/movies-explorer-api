const router = require('express').Router();
const userRouter = require('./users');
const movieRouter = require('./movies');
const auth = require('../middlewares/auth');
const {
  createUser,
  login,
  signOut,
} = require('../controllers/users');
const {
  validateCreateUser,
  validateLogin,
} = require('../middlewares/validations');
const NotFoundError = require('../errors/not-found-error');

router.post('/signup', validateCreateUser, createUser);
router.post('/signin', validateLogin, login);
router.use(auth);
router.post('/signout', signOut);
router.use('/users', userRouter);
router.use('/movies', movieRouter);
router.use('*', (req, res, next) => {
  next(new NotFoundError('Страница не найдена'));
});

module.exports = router;
