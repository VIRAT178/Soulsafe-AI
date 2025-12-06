# SoulSafe AI - Digital Time Capsule Platform

## 🚀 Overview

SoulSafe AI is a secure, AI-powered digital time capsule platform that allows users to store messages, multimedia, and digital keepsakes to be unlocked or shared on specified future dates or triggered by life events. The platform features advanced AI content analysis for emotion detection, context awareness, and personalized unlocking recommendations.

## 🏗️ System Architecture

### Technology Stack
- **Frontend**: React.js with modern UI/UX inspired by AI-powered business platforms
- **Backend**: Node.js with Express.js for RESTful APIs
- **Microservices**: Java Spring Boot for AI processing and encryption
- **AI/ML**: Python with TensorFlow/PyTorch for emotion detection and content analysis
- **Database**: MongoDB for document storage, Redis for caching
- **Security**: End-to-end encryption, JWT authentication, OAuth2

### Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │   Node.js API   │    │  Java Services  │
│                 │    │                 │    │                 │
│ - Dashboard     │◄──►│ - Authentication│◄──►│ - AI Processing │
│ - Time Capsules │    │ - File Upload   │    │ - Encryption    │
│ - AI Insights   │    │ - User Management│   │ - Scheduling    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MongoDB       │    │     Redis        │    │   Python AI     │
│                 │    │                 │    │                 │
│ - User Data     │    │ - Session Cache │    │ - Emotion AI    │
│ - Capsules      │    │ - Rate Limiting │    │ - Content Analysis│
│ - Media Files   │    │ - Queue Jobs    │    │ - Recommendations│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Installation & Setup

### Prerequisites

- **Node.js** (v16 or higher)
- **Java** (v11 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (v5.0 or higher)
- **Redis** (v6.0 or higher)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/soulsafe-ai.git
cd soulsafe-ai
```

### 2. Backend Setup (Node.js)

```bash
cd Backend/Backend\(Node\)/
npm install
```

Create `.env` file:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/soulsafe
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
ENCRYPTION_MASTER_KEY=your-master-encryption-key
FRONTEND_URL=http://localhost:3000
AI_SERVICE_URL=http://localhost:5001
JAVA_SERVICE_URL=http://localhost:8080
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup (React)

```bash
cd Frontend/
npm install
```

Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_AI_SERVICE_URL=http://localhost:5001
REACT_APP_JAVA_SERVICE_URL=http://localhost:8080
```

Start the frontend:
```bash
npm start
```

### 4. Python AI Service Setup

```bash
cd AI-Python/
pip install -r requirements.txt
```

Create `.env` file:
```env
FLASK_ENV=development
PORT=5001
REDIS_URL=redis://localhost:6379
MODEL_CACHE_DIR=./models
```

Start the AI service:
```bash
python app.py
```

### 5. Java Microservices Setup

```bash
cd Backend/Backend\(Java\)/
mvn clean install
```

Create `application.yml`:
```yaml
server:
  port: 8080

spring:
  application:
    name: soulsafe-ai-services
  
  datasource:
    url: jdbc:postgresql://localhost:5432/soulsafe
    username: soulsafe
    password: your-password
  
  redis:
    host: localhost
    port: 6379

ai:
  python:
    api:
      url: http://localhost:5001

encryption:
  master:
    key: your-master-encryption-key
```

Start the Java service:
```bash
mvn spring-boot:run
```

### 6. Database Setup

#### MongoDB
```bash
# Start MongoDB
mongod

# Create database and user
mongo
use soulsafe
db.createUser({
  user: "soulsafe",
  pwd: "your-password",
  roles: ["readWrite"]
})
```

#### Redis
```bash
# Start Redis
redis-server
```

## 🔧 Configuration

### Environment Variables

#### Backend (Node.js)
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: JWT signing secret
- `ENCRYPTION_MASTER_KEY`: Master encryption key
- `FRONTEND_URL`: Frontend URL for CORS
- `AI_SERVICE_URL`: Python AI service URL
- `JAVA_SERVICE_URL`: Java microservices URL

#### Frontend (React)
- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_AI_SERVICE_URL`: AI service URL
- `REACT_APP_JAVA_SERVICE_URL`: Java service URL

#### Python AI Service
- `FLASK_ENV`: Flask environment
- `PORT`: Service port (default: 5001)
- `REDIS_URL`: Redis connection string
- `MODEL_CACHE_DIR`: Model cache directory

#### Java Services
- `server.port`: Server port (default: 8080)
- `spring.datasource.url`: Database URL
- `spring.redis.host`: Redis host
- `ai.python.api.url`: Python AI service URL
- `encryption.master.key`: Master encryption key

## 🚀 Running the Application

### Development Mode

1. **Start MongoDB and Redis**
```bash
mongod
redis-server
```

2. **Start Backend Services**
```bash
# Terminal 1: Node.js Backend
cd Backend/Backend\(Node\)/
npm run dev

# Terminal 2: Java Services
cd Backend/Backend\(Java\)/
mvn spring-boot:run

# Terminal 3: Python AI Service
cd AI-Python/
python app.py
```

3. **Start Frontend**
```bash
# Terminal 4: React Frontend
cd Frontend/
npm start
```

### Production Mode

1. **Build Frontend**
```bash
cd Frontend/
npm run build
```

2. **Start Backend Services**
```bash
# Node.js Backend
cd Backend/Backend\(Node\)/
NODE_ENV=production npm start

# Java Services
cd Backend/Backend\(Java\)/
mvn spring-boot:run -Dspring.profiles.active=production

# Python AI Service
cd AI-Python/
FLASK_ENV=production python app.py
```

## 📱 Features

### 🔐 Security Features
- **End-to-end encryption** using AES-256-GCM
- **JWT-based authentication** with refresh tokens
- **Rate limiting** and DDoS protection
- **Secure file upload** with virus scanning
- **Privacy-preserving AI analysis**

### 🤖 AI Capabilities
- **Real-time emotion detection** from text and audio
- **Content sentiment analysis** with confidence scores
- **Intelligent categorization** and tagging
- **Personalized recommendations** based on user behavior
- **Context-aware unlocking suggestions**

### 📅 Smart Scheduling
- **Date-based unlocking** with precise timing
- **Life event triggers** (birthdays, anniversaries, holidays)
- **Conditional unlocking** based on AI insights
- **Flexible scheduling options** with timezone support

### 🎨 Modern UI/UX
- **Dark-themed interface** inspired by AI platforms
- **Responsive design** for all devices
- **Interactive dashboard** with real-time updates
- **AI-powered insights** and recommendations
- **Smooth animations** and transitions

## 🔌 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### POST `/api/auth/login`
Login user
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Capsule Endpoints

#### GET `/api/capsules`
Get user's capsules
```json
{
  "capsules": [...],
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 50
  }
}
```

#### POST `/api/capsules`
Create new capsule
```json
{
  "title": "My Memory",
  "description": "A special moment",
  "content": {
    "type": "text",
    "text": "This is my memory..."
  },
  "unlockConditions": {
    "type": "date",
    "unlockDate": "2024-12-25T00:00:00Z"
  }
}
```

### AI Endpoints

#### POST `/api/ai/analyze`
Analyze content with AI
```json
{
  "content": "I'm so happy today!",
  "type": "text"
}
```

#### GET `/api/ai/recommendations/{userId}`
Get personalized recommendations

## 🧪 Testing

### Backend Tests
```bash
cd Backend/Backend\(Node\)/
npm test
```

### Frontend Tests
```bash
cd Frontend/
npm test
```

### Java Tests
```bash
cd Backend/Backend\(Java\)/
mvn test
```

### Python Tests
```bash
cd AI-Python/
python -m pytest tests/
```

## 📊 Monitoring & Logging

### Health Checks
- Backend: `GET /api/health`
- AI Service: `GET /health`
- Java Services: `GET /actuator/health`

### Logging
- **Backend**: Winston logger with file rotation
- **Frontend**: Console logging in development
- **AI Service**: Python logging with file output
- **Java Services**: Logback with structured logging

## 🔒 Security Considerations

### Data Protection
- All sensitive data encrypted at rest
- End-to-end encryption for capsule content
- Secure key management and rotation
- Regular security audits and updates

### Access Control
- Role-based access control (RBAC)
- Multi-factor authentication support
- Session management with secure tokens
- API rate limiting and throttling

### Privacy
- GDPR compliant data handling
- User data anonymization options
- Transparent privacy policies
- User consent management

## 🚀 Deployment

### Docker Deployment

#### Backend Dockerfile
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: soulsafe-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: soulsafe-backend
  template:
    metadata:
      labels:
        app: soulsafe-backend
    spec:
      containers:
      - name: backend
        image: soulsafe/backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: soulsafe-secrets
              key: mongodb-uri
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.soulsafe.ai](https://docs.soulsafe.ai)
- **Issues**: [GitHub Issues](https://github.com/your-username/soulsafe-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/soulsafe-ai/discussions)
- **Email**: support@soulsafe.ai

## 🙏 Acknowledgments

- React.js community for the amazing frontend framework
- Spring Boot team for the robust backend framework
- TensorFlow and PyTorch teams for AI/ML capabilities
- MongoDB and Redis teams for excellent database solutions

---

**SoulSafe AI** - Preserving memories with AI-powered security and intelligence.
