const router = require('express').Router();
const { getUserInfo, updateProfileInfo } = require('../controllers/users');
const {
  validateUpdateprofile,
} = require('../middlewares/validations');
const auth = require('../middlewares/auth');

router.use(auth);
router.get('/me', getUserInfo);
router.patch('/me', validateUpdateprofile, updateProfileInfo);

module.exports = router;
