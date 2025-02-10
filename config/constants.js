module.exports = {
  PORT: process.env.PORT || 3001, // Cambia el puerto a 3001
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/api-tareas',
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret'
};
