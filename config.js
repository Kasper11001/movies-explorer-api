const {
  dataMovies = 'mongodb://localhost:27017/moviesdb',
  PORT = 3000,
  NODE_ENV,
  JWT_SECRET,
} = process.env;

module.exports = {
  dataMovies,
  NODE_ENV,
  PORT,
  JWT_SECRET,
};
