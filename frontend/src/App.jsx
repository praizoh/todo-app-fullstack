import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

function App() {
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingTodo, setEditingTodo] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      fetchTodos();
    }
  }, []);

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/login', loginForm);
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setLoginForm({ username: '', password: '' });
      
      await fetchTodos();
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setTodos([]);
    }
  };

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/todos');
      setTodos(response.data);
    } catch (err) {
      setError('Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      setLoading(true);
      const response = await api.post('/todos', { title: newTodo });
      setTodos([...todos, response.data]);
      setNewTodo('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add todo');
    } finally {
      setLoading(false);
    }
  };

  const updateTodo = async (id, updates) => {
    try {
      const response = await api.put(`/todos/${id}`, updates);
      setTodos(todos.map(todo => 
        todo.id === id ? response.data : todo
      ));
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update todo');
    }
  };

  const deleteTodo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) {
      return;
    }

    try {
      await api.delete(`/todos/${id}`);
      setTodos(todos.filter(todo => todo.id !== id));
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete todo');
    }
  };

  const startEdit = (todo) => {
    setEditingTodo(todo.id);
    setEditTitle(todo.title);
  };

  const saveEdit = async () => {
    if (!editTitle.trim()) {
      setError('Title cannot be empty');
      return;
    }

    await updateTodo(editingTodo, { title: editTitle });
    setEditingTodo(null);
    setEditTitle('');
  };

  const cancelEdit = () => {
    setEditingTodo(null);
    setEditTitle('');
  };

  const toggleComplete = async (todo) => {
    await updateTodo(todo.id, { completed: !todo.completed });
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const completedCount = todos.filter(todo => todo.completed).length;
  const activeCount = todos.length - completedCount;

  if (!user) {
    return (
      <div className="app">
        <div className="login-container">
          <h1>Todo App</h1>
          <form onSubmit={login} className="login-form" data-testid="login-form">
            <h2>Login</h2>
            {error && <div className="error" data-testid="error-message">{error}</div>}
            
            <input
              type="text"
              placeholder="Username"
              value={loginForm.username}
              onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
              data-testid="username-input"
              required
            />
            
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              data-testid="password-input"
              required
            />
            
            <button 
              type="submit" 
              disabled={loading}
              data-testid="login-button"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            
            <div className="demo-credentials">
              <p><strong>Demo Credentials:</strong></p>
              <p>Username: testuser, Password: password123</p>
              <p>Username: admin, Password: admin123</p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Todo App</h1>
        <div className="user-info">
          <span data-testid="welcome-message">Welcome, {user.username}!</span>
          <button onClick={logout} className="logout-btn" data-testid="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="main-content">
        {error && <div className="error" data-testid="error-message">{error}</div>}
        
        <form onSubmit={addTodo} className="add-todo-form" data-testid="add-todo-form">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            data-testid="new-todo-input"
            className="new-todo-input"
          />
          <button 
            type="submit" 
            disabled={loading || !newTodo.trim()}
            data-testid="add-todo-button"
            className="add-btn"
          >
            {loading ? 'Adding...' : 'Add Todo'}
          </button>
        </form>

        <div className="filters" data-testid="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
            data-testid="filter-all"
          >
            All ({todos.length})
          </button>
          <button 
            className={filter === 'active' ? 'active' : ''}
            onClick={() => setFilter('active')}
            data-testid="filter-active"
          >
            Active ({activeCount})
          </button>
          <button 
            className={filter === 'completed' ? 'active' : ''}
            onClick={() => setFilter('completed')}
            data-testid="filter-completed"
          >
            Completed ({completedCount})
          </button>
        </div>

        <div className="todos-container">
          {loading && todos.length === 0 ? (
            <div className="loading" data-testid="loading">Loading todos...</div>
          ) : filteredTodos.length === 0 ? (
            <div className="empty-state" data-testid="empty-state">
              {filter === 'all' ? 'No todos yet. Add one above!' :
               filter === 'active' ? 'No active todos!' :
               'No completed todos!'}
            </div>
          ) : (
            <ul className="todos-list" data-testid="todos-list">
              {filteredTodos.map(todo => (
                <li 
                  key={todo.id} 
                  className={`todo-item ${todo.completed ? 'completed' : ''}`}
                  data-testid={`todo-item-${todo.id}`}
                >
                  <div className="todo-content">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleComplete(todo)}
                      data-testid={`todo-checkbox-${todo.id}`}
                      className="todo-checkbox"
                    />
                    
                    {editingTodo === todo.id ? (
                      <div className="edit-form">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          data-testid={`edit-input-${todo.id}`}
                          className="edit-input"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') saveEdit();
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          autoFocus
                        />
                        <div className="edit-buttons">
                          <button 
                            onClick={saveEdit}
                            data-testid={`save-edit-${todo.id}`}
                            className="save-btn"
                          >
                            Save
                          </button>
                          <button 
                            onClick={cancelEdit}
                            data-testid={`cancel-edit-${todo.id}`}
                            className="cancel-btn"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span 
                        className="todo-title"
                        data-testid={`todo-title-${todo.id}`}
                        onDoubleClick={() => startEdit(todo)}
                      >
                        {todo.title}
                      </span>
                    )}
                  </div>
                  
                  <div className="todo-actions">
                    {editingTodo !== todo.id && (
                      <>
                        <button
                          onClick={() => startEdit(todo)}
                          data-testid={`edit-button-${todo.id}`}
                          className="edit-btn"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          data-testid={`delete-button-${todo.id}`}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {todos.length > 0 && (
          <div className="stats" data-testid="todo-stats">
            <p>Total: {todos.length} | Active: {activeCount} | Completed: {completedCount}</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;