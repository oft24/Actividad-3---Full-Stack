const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Middleware de autenticación
const authenticate = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, 'secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

// Rutas de tareas
app.get('/tareas', authenticate, async (req, res) => {
  try {
    const data = await fs.readFile('tareas.json', 'utf8');
    const tareas = JSON.parse(data);
    res.send(tareas);
  } catch (error) {
    res.status(500).send({ error: 'Error al leer las tareas.' });
  }
});

app.post('/tareas', authenticate, async (req, res) => {
  const { title, description } = req.body;
  const newTask = { id: Date.now(), title, description };
  try {
    const data = await fs.readFile('tareas.json', 'utf8');
    const tareas = JSON.parse(data);
    tareas.push(newTask);
    await fs.writeFile('tareas.json', JSON.stringify(tareas));
    res.status(201).send(newTask);
  } catch (error) {
    res.status(500).send({ error: 'Error al agregar la tarea.' });
  }
});

app.put('/tareas/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  try {
    const data = await fs.readFile('tareas.json', 'utf8');
    const tareas = JSON.parse(data);
    const taskIndex = tareas.findIndex(task => task.id == id);
    if (taskIndex === -1) {
      return res.status(404).send({ error: 'Tarea no encontrada.' });
    }
    tareas[taskIndex] = { id, title, description };
    await fs.writeFile('tareas.json', JSON.stringify(tareas));
    res.send(tareas[taskIndex]);
  } catch (error) {
    res.status(500).send({ error: 'Error al actualizar la tarea.' });
  }
});

app.delete('/tareas/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const data = await fs.readFile('tareas.json', 'utf8');
    const tareas = JSON.parse(data);
    const newTareas = tareas.filter(task => task.id != id);
    await fs.writeFile('tareas.json', JSON.stringify(newTareas));
    res.send({ message: 'Tarea eliminada.' });
  } catch (error) {
    res.status(500).send({ error: 'Error al eliminar la tarea.' });
  }
});

// Rutas de autenticación
app.post('/register', async (req, res) => {
  const { username, password, email } = req.body;
  const hashedPassword = await bcrypt.hash(password, 8);
  const newUser = { id: Date.now(), username, password: hashedPassword, email };
  try {
    const data = await fs.readFile('users.json', 'utf8');
    const users = JSON.parse(data);
    users.push(newUser);
    await fs.writeFile('users.json', JSON.stringify(users));
    res.status(201).send(newUser);
  } catch (error) {
    res.status(500).send({ error: 'Error al registrar el usuario.' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const data = await fs.readFile('users.json', 'utf8');
    const users = JSON.parse(data);
    const user = users.find(user => user.username === username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).send({ error: 'Credenciales inválidas.' });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, 'secret_key');
    res.send({ user, token });
  } catch (error) {
    res.status(500).send({ error: 'Error al iniciar sesión.' });
  }
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  res.status(500).send({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
