const router = require('express').Router();
const {
  validateCreateMovie,
  validateMovieId,
} = require('../middlewares/validations');
const {
  getCurrentUserMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');

router.get('/', getCurrentUserMovies);
router.post('/', validateCreateMovie, createMovie);
router.delete('/:_id', validateMovieId, deleteMovie);

module.exports = router;
