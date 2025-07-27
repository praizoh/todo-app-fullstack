const request = require('supertest');
const app = require('../server');

describe('Todo API Tests', () => {
  let authToken = '';
  let testTodoId = null;

  // Test data
  const validUser = {
    username: 'testuser',
    password: 'password123'
  };

  const invalidUser = {
    username: 'wronguser',
    password: 'wrongpass'
  };

  const newTodo = {
    title: 'Test Todo Item'
  };

  // Helper function to authenticate
  const authenticate = async () => {
    const response = await request(app)
      .post('/api/login')
      .send(validUser);
    
    authToken = `Bearer ${response.body.token}`;
    return response;
  };

  describe('Health Check', () => {
    test('GET /api/health should return status OK', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Authentication Tests', () => {
    describe('POST /api/login', () => {
      test('should login with valid credentials', async () => {
        const response = await request(app)
          .post('/api/login')
          .send(validUser)
          .expect(200);

        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('username', validUser.username);
        expect(response.body.user).toHaveProperty('id');
      });

      test('should reject invalid credentials', async () => {
        const response = await request(app)
          .post('/api/login')
          .send(invalidUser)
          .expect(401);

        expect(response.body).toHaveProperty('error', 'Invalid credentials');
      });

      test('should reject empty credentials', async () => {
        const response = await request(app)
          .post('/api/login')
          .send({})
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Username and password required');
      });

      test('should reject missing username', async () => {
        const response = await request(app)
          .post('/api/login')
          .send({ password: 'test123' })
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Username and password required');
      });

      test('should reject missing password', async () => {
        const response = await request(app)
          .post('/api/login')
          .send({ username: 'testuser' })
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Username and password required');
      });
    });

    describe('POST /api/logout', () => {
      beforeEach(async () => {
        await authenticate();
      });

      test('should logout authenticated user', async () => {
        const response = await request(app)
          .post('/api/logout')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body).toHaveProperty('message', 'Logged out successfully');
      });

      test('should reject unauthenticated logout', async () => {
        const response = await request(app)
          .post('/api/logout')
          .expect(401);

        expect(response.body).toHaveProperty('error', 'Unauthorized');
      });
    });
  });

  describe('Todos CRUD Tests', () => {
    beforeEach(async () => {
      await authenticate();
    });

    describe('GET /api/todos', () => {
      test('should get all todos for authenticated user', async () => {
        const response = await request(app)
          .get('/api/todos')
          .set('Authorization', authToken)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        
        // Check todo structure
        const todo = response.body[0];
        expect(todo).toHaveProperty('id');
        expect(todo).toHaveProperty('title');
        expect(todo).toHaveProperty('completed');
        expect(todo).toHaveProperty('userId');
      });

      test('should reject unauthenticated request', async () => {
        const response = await request(app)
          .get('/api/todos')
          .expect(401);

        expect(response.body).toHaveProperty('error', 'Unauthorized');
      });
    });

    describe('POST /api/todos', () => {
      test('should create new todo with valid data', async () => {
        const response = await request(app)
          .post('/api/todos')
          .set('Authorization', authToken)
          .send(newTodo)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('title', newTodo.title);
        expect(response.body).toHaveProperty('completed', false);
        expect(response.body).toHaveProperty('userId');

        testTodoId = response.body.id; // Save for later tests
      });

      test('should reject empty title', async () => {
        const response = await request(app)
          .post('/api/todos')
          .set('Authorization', authToken)
          .send({ title: '' })
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Title is required');
      });

      test('should reject whitespace-only title', async () => {
        const response = await request(app)
          .post('/api/todos')
          .set('Authorization', authToken)
          .send({ title: '   ' })
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Title is required');
      });

      test('should reject missing title', async () => {
        const response = await request(app)
          .post('/api/todos')
          .set('Authorization', authToken)
          .send({})
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Title is required');
      });

      test('should trim whitespace from title', async () => {
        const todoWithSpaces = { title: '  Spaced Todo  ' };
        
        const response = await request(app)
          .post('/api/todos')
          .set('Authorization', authToken)
          .send(todoWithSpaces)
          .expect(201);

        expect(response.body.title).toBe('Spaced Todo');
      });

      test('should reject unauthenticated request', async () => {
        const response = await request(app)
          .post('/api/todos')
          .send(newTodo)
          .expect(401);

        expect(response.body).toHaveProperty('error', 'Unauthorized');
      });
    });

    describe('GET /api/todos/:id', () => {
      beforeEach(async () => {
        // Create a test todo
        const createResponse = await request(app)
          .post('/api/todos')
          .set('Authorization', authToken)
          .send({ title: 'Get Test Todo' });
        
        testTodoId = createResponse.body.id;
      });

      test('should get specific todo by id', async () => {
        const response = await request(app)
          .get(`/api/todos/${testTodoId}`)
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body).toHaveProperty('id', testTodoId);
        expect(response.body).toHaveProperty('title', 'Get Test Todo');
      });

      test('should return 404 for non-existent todo', async () => {
        const response = await request(app)
          .get('/api/todos/99999')
          .set('Authorization', authToken)
          .expect(404);

        expect(response.body).toHaveProperty('error', 'Todo not found');
      });

      test('should reject invalid id format', async () => {
        const response = await request(app)
          .get('/api/todos/invalid')
          .set('Authorization', authToken)
          .expect(404);

        expect(response.body).toHaveProperty('error', 'Todo not found');
      });
    });

    describe('PUT /api/todos/:id', () => {
      beforeEach(async () => {
        // Create a test todo
        const createResponse = await request(app)
          .post('/api/todos')
          .set('Authorization', authToken)
          .send({ title: 'Update Test Todo' });
        
        testTodoId = createResponse.body.id;
      });

      test('should update todo title', async () => {
        const updatedData = { title: 'Updated Todo Title' };
        
        const response = await request(app)
          .put(`/api/todos/${testTodoId}`)
          .set('Authorization', authToken)
          .send(updatedData)
          .expect(200);

        expect(response.body).toHaveProperty('id', testTodoId);
        expect(response.body).toHaveProperty('title', updatedData.title);
      });

      test('should update todo completion status', async () => {
        const updatedData = { completed: true };
        
        const response = await request(app)
          .put(`/api/todos/${testTodoId}`)
          .set('Authorization', authToken)
          .send(updatedData)
          .expect(200);

        expect(response.body).toHaveProperty('completed', true);
      });

      test('should update both title and completion status', async () => {
        const updatedData = { 
          title: 'Complete Updated Todo', 
          completed: true 
        };
        
        const response = await request(app)
          .put(`/api/todos/${testTodoId}`)
          .set('Authorization', authToken)
          .send(updatedData)
          .expect(200);

        expect(response.body).toHaveProperty('title', updatedData.title);
        expect(response.body).toHaveProperty('completed', true);
      });

      test('should reject empty title', async () => {
        const response = await request(app)
          .put(`/api/todos/${testTodoId}`)
          .set('Authorization', authToken)
          .send({ title: '' })
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Title cannot be empty');
      });

      test('should return 404 for non-existent todo', async () => {
        const response = await request(app)
          .put('/api/todos/99999')
          .set('Authorization', authToken)
          .send({ title: 'Updated' })
          .expect(404);

        expect(response.body).toHaveProperty('error', 'Todo not found');
      });
    });

    describe('DELETE /api/todos/:id', () => {
      beforeEach(async () => {
        // Create a test todo
        const createResponse = await request(app)
          .post('/api/todos')
          .set('Authorization', authToken)
          .send({ title: 'Delete Test Todo' });
        
        testTodoId = createResponse.body.id;
      });

      test('should delete existing todo', async () => {
        const response = await request(app)
          .delete(`/api/todos/${testTodoId}`)
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body).toHaveProperty('id', testTodoId);
        expect(response.body).toHaveProperty('title', 'Delete Test Todo');

        // Verify todo is actually deleted
        await request(app)
          .get(`/api/todos/${testTodoId}`)
          .set('Authorization', authToken)
          .expect(404);
      });

      test('should return 404 for non-existent todo', async () => {
        const response = await request(app)
          .delete('/api/todos/99999')
          .set('Authorization', authToken)
          .expect(404);

        expect(response.body).toHaveProperty('error', 'Todo not found');
      });
    });
  });

  describe('Authorization Tests', () => {
    const unauthorizedEndpoints = [
      { method: 'get', path: '/api/todos' },
      { method: 'post', path: '/api/todos' },
      { method: 'get', path: '/api/todos/1' },
      { method: 'put', path: '/api/todos/1' },
      { method: 'delete', path: '/api/todos/1' }
    ];

    unauthorizedEndpoints.forEach(({ method, path }) => {
      test(`${method.toUpperCase()} ${path} should require authentication`, async () => {
        const response = await request(app)[method](path).expect(401);
        expect(response.body).toHaveProperty('error', 'Unauthorized');
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/unknown')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Route not found');
    });
  });
});