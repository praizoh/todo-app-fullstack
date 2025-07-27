# Todo App - Full Stack with Automated Testing

A comprehensive full-stack Todo application built with React and Node.js, featuring extensive automated testing suite including API tests, E2E tests, and CI/CD pipeline.

## 🚀 Quick Start (2 Minutes Setup)

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd todo-app
npm install
```

### 2. Start Backend Server
```bash
cd backend
npm install
npm start
# Server runs on http://localhost:5000
```

### 3. Start Frontend (New Terminal)
```bash
cd frontend
npm install
npm start
# App opens at http://localhost:3000
```

### 4. Login with Demo Credentials
- **Username**: `testuser` / **Password**: `password123`
- **Username**: `admin` / **Password**: `admin123`

## 🧪 Running Tests

### API Tests (Backend)
```bash
cd backend
npm test                    # Run tests with coverage
npm run test:watch         # Watch mode
```

### E2E Tests (Frontend)
```bash
cd frontend
npx cypress open           # Interactive mode
npx cypress run            # Headless mode
npm run test:e2e          # Full E2E suite
```

### All Tests
```bash
npm run test:all          # Run all tests (from root)
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18, Axios, CSS3
- **Backend**: Node.js, Express, CORS
- **Testing**: Cypress (E2E), Supertest (API), Jest
- **CI/CD**: GitHub Actions
- **Deployment**: Render (ready)

### Project Structure
```
todo-app/
├── backend/
│   ├── server.js              # Express server
│   ├── tests/api.test.js      # API test suite
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.js             # Main React component
│   │   └── App.css            # Styling
│   ├── cypress/
│   │   └── e2e/todo.cy.js     # E2E test suite
│   └── package.json
├── .github/workflows/ci.yml   # CI/CD pipeline
├── TEST_PLAN.md              # Comprehensive test strategy
└── README.md
```

## 🎯 Features Tested

### ✅ Authentication
- Login with valid/invalid credentials
- Session persistence
- Logout functionality
- Unauthorized access protection

### ✅ Todo Management
- Create new todos
- Edit existing todos (inline editing)
- Delete todos (with confirmation)
- Mark complete/incomplete
- Filter by status (All/Active/Completed)

### ✅ Data Validation
- Empty title validation
- Whitespace handling
- Input sanitization
- Error message display

### ✅ User Experience
- Responsive design (mobile/tablet)
- Loading states
- Empty state handling
- Keyboard shortcuts
- Form validation feedback

## 🔧 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/login` | User authentication | No |
| POST | `/api/logout` | User logout | Yes |
| GET | `/api/todos` | Get all todos | Yes |
| POST | `/api/todos` | Create new todo | Yes |
| GET | `/api/todos/:id` | Get specific todo | Yes |
| PUT | `/api/todos/:id` | Update todo | Yes |
| DELETE | `/api/todos/:id` | Delete todo | Yes |

## 🧪 Test Coverage

### Backend API Tests (Supertest + Jest)
- ✅ Authentication endpoints (login/logout)
- ✅ CRUD operations for todos
- ✅ Authorization middleware
- ✅ Input validation
- ✅ Error handling (401, 404, 400, 500)
- ✅ Edge cases and negative scenarios

### Frontend E2E Tests (Cypress)
- ✅ Complete user journeys
- ✅ Form interactions and validation
- ✅ Dynamic content updates
- ✅ Browser compatibility
- ✅ Responsive design testing
- ✅ Accessibility checks
- ✅ Performance monitoring

### Coverage Reports
- **Backend**: >90% code coverage
- **E2E**: 100% critical user journeys
- **API Endpoints**: 100% coverage

## 🚀 Deployment (Render)

### Backend Service
1. Connect GitHub repo to Render
2. Create **Web Service**
3. **Build Command**: `cd backend && npm install`
4. **Start Command**: `cd backend && npm start`
5. **Environment**: Node.js

### Frontend Service  
1. Create **Static Site**
2. **Build Command**: `cd frontend && npm run build`
3. **Publish Directory**: `frontend/build`
4. **Environment Variables**:
   - `REACT_APP_API_URL`: Your backend service URL

### Environment Variables
```bash
# Frontend (.env)
REACT_APP_API_URL=https://your-backend.render.com/api

# Backend (.env) - Optional
PORT=5000
NODE_ENV=production
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
- ✅ **Backend Tests**: API testing with coverage
- ✅ **Frontend Tests**: E2E testing across browsers
- ✅ **Security Audit**: Dependency vulnerability checks
- ✅ **Performance Tests**: Lighthouse CI integration
- ✅ **Parallel Execution**: Matrix strategy for efficiency
- ✅ **Artifact Collection**: Screenshots, videos, reports

### Pipeline Stages
1. **Code Quality**: Linting, formatting
2. **Unit Tests**: Backend API tests
3. **Integration Tests**: E2E user journeys
4. **Security**: Vulnerability scanning
5. **Performance**: Lighthouse audits
6. **Deploy**: Automatic deployment on main branch

## 📊 Quality Metrics

### Performance Targets
- API Response Time: <200ms
- Page Load Time: <2 seconds
- First Contentful Paint: <1.5 seconds

### Reliability Standards
- Test Pass Rate: >95%
- Code Coverage: >90%
- Flaky Test Rate: <2%

## 🐛 Known Limitations

- **Data Storage**: In-memory only (resets on server restart)
- **Authentication**: Simple token-based (demo purposes)
- **Scalability**: Single-server deployment
- **Real-time**: No live collaboration features

## 🛠️ Development Commands

```bash
# Root level
npm install              # Install all dependencies
npm run dev             # Start both frontend and backend
npm run test:all        # Run all tests
npm run build          # Build for production

# Backend
cd backend
npm start              # Start server
npm run dev           # Development with nodemon
npm test              # Run API tests
npm run test:watch    # Watch mode

# Frontend  
cd frontend
npm start             # Start development server
npm run build         # Build for production
npx cypress open      # Open Cypress UI
npx cypress run       # Run E2E tests headless
```

## 📚 Documentation

- **[Test Plan](TEST_PLAN.md)**: Comprehensive testing strategy
- **[API Documentation](backend/README.md)**: Backend API details
- **[Frontend Guide](frontend/README.md)**: React app documentation

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`npm run test:all`)
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you have any questions or run into issues:

1. Check the [Test Plan](TEST_PLAN.md) for detailed testing information
2. Review the API documentation in `/backend`
3. Look at the Cypress tests in `/frontend/cypress/e2e`
4. Open an issue on GitHub

---

**⚡ Quick Demo**: Visit the deployed app at `https://your-frontend.render.com` (after deployment)

**🧪 Test Results**: All tests should pass in under 2 minutes. The comprehensive test suite includes 50+ test cases covering authentication, CRUD operations, data validation, and user experience scenarios.