const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data storage
let todos = [
  { id: 1, title: 'Learn React', completed: false, userId: 1 },
  { id: 2, title: 'Build Todo App', completed: false, userId: 1 },
  { id: 3, title: 'Write Tests', completed: true, userId: 1 }
];

let users = [
  { id: 1, username: 'testuser', password: 'password123' },
  { id: 2, username: 'admin', password: 'admin123' }
];

let currentUserId = null;
let nextTodoId = 4;

// Helper functions
const findUserByCredentials = (username, password) => {
  return users.find(user => user.username === username && user.password === password);
};

const isAuthenticated = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token || token !== 'Bearer valid-token') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.userId = 1; // Simple auth - always user 1 for demo
  next();
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Authentication
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  
  const user = findUserByCredentials(username, password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  currentUserId = user.id;
  res.json({ 
    token: 'valid-token', 
    user: { id: user.id, username: user.username }
  });
});

app.post('/api/logout', isAuthenticated, (req, res) => {
  currentUserId = null;
  res.json({ message: 'Logged out successfully' });
});

// Todos CRUD operations
app.get('/api/todos', isAuthenticated, (req, res) => {
  const userTodos = todos.filter(todo => todo.userId === req.userId);
  res.json(userTodos);
});

app.get('/api/todos/:id', isAuthenticated, (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id && t.userId === req.userId);
  
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  res.json(todo);
});

app.post('/api/todos', isAuthenticated, (req, res) => {
  const { title } = req.body;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  const newTodo = {
    id: nextTodoId++,
    title: title.trim(),
    completed: false,
    userId: req.userId
  };
  
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

app.put('/api/todos/:id', isAuthenticated, (req, res) => {
  const id = parseInt(req.params.id);
  const { title, completed } = req.body;
  
  const todoIndex = todos.findIndex(t => t.id === id && t.userId === req.userId);
  
  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  if (title !== undefined) {
    if (title.trim() === '') {
      return res.status(400).json({ error: 'Title cannot be empty' });
    }
    todos[todoIndex].title = title.trim();
  }
  
  if (completed !== undefined) {
    todos[todoIndex].completed = Boolean(completed);
  }
  
  res.json(todos[todoIndex]);
});

app.delete('/api/todos/:id', isAuthenticated, (req, res) => {
  const id = parseInt(req.params.id);
  const todoIndex = todos.findIndex(t => t.id === id && t.userId === req.userId);
  
  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  const deletedTodo = todos.splice(todoIndex, 1)[0];
  res.json(deletedTodo);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;