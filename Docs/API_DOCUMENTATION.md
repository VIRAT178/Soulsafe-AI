# SoulSafe AI - API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://api.soulsafe.ai/api
```

## Authentication

All API endpoints require authentication except for registration and login. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### POST `/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "preferences": {
      "theme": "dark",
      "notifications": {
        "email": true,
        "push": true
      }
    }
  }
}
```

#### POST `/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "preferences": {...},
    "subscription": {...},
    "lastLogin": "2023-09-01T10:30:00Z"
  }
}
```

#### GET `/auth/profile`
Get current user profile.

**Response:**
```json
{
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "profilePicture": null,
    "preferences": {...},
    "subscription": {...},
    "lastLogin": "2023-09-01T10:30:00Z",
    "createdAt": "2023-08-01T10:30:00Z"
  }
}
```

#### PUT `/auth/profile`
Update user profile.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "preferences": {
    "theme": "dark",
    "notifications": {
      "email": true,
      "push": false
    }
  }
}
```

#### PUT `/auth/change-password`
Change user password.

**Request Body:**
```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass123"
}
```

### Capsules

#### GET `/capsules`
Get user's capsules with pagination and filtering.

**Query Parameters:**
- `status` (optional): Filter by status (draft, active, unlocked, archived, deleted)
- `category` (optional): Filter by category (personal, family, work, creative, memories, other)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): Sort order (asc, desc)

**Response:**
```json
{
  "capsules": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "title": "My Memory",
      "description": "A special moment",
      "owner": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "username": "johndoe",
        "firstName": "John",
        "lastName": "Doe"
      },
      "content": {
        "type": "text",
        "metadata": {
          "tags": ["memory", "family"]
        }
      },
      "unlockConditions": {
        "type": "date",
        "unlockDate": "2024-12-25T00:00:00Z",
        "isUnlocked": false
      },
      "status": "active",
      "category": "personal",
      "views": 0,
      "createdAt": "2023-09-01T10:30:00Z",
      "updatedAt": "2023-09-01T10:30:00Z"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 50
  }
}
```

#### GET `/capsules/:id`
Get a specific capsule by ID.

**Response:**
```json
{
  "capsule": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "title": "My Memory",
    "description": "A special moment",
    "owner": "64f8a1b2c3d4e5f6a7b8c9d0",
    "content": {
      "type": "text",
      "text": "encrypted_text_here",
      "metadata": {
        "tags": ["memory", "family"]
      }
    },
    "unlockConditions": {
      "type": "date",
      "unlockDate": "2024-12-25T00:00:00Z",
      "isUnlocked": false
    },
    "recipients": [],
    "aiAnalysis": {
      "emotion": {
        "primary": "joy",
        "secondary": "love",
        "confidence": 0.85
      },
      "sentiment": {
        "score": 0.7,
        "magnitude": 0.8
      },
      "topics": ["family", "memory"],
      "keywords": ["special", "moment", "family"],
      "analyzedAt": "2023-09-01T10:35:00Z"
    },
    "privacy": {
      "visibility": "private",
      "accessLog": []
    },
    "status": "active",
    "category": "personal",
    "tags": ["memory", "family"],
    "size": 1024,
    "views": 1,
    "lastAccessed": "2023-09-01T10:30:00Z",
    "createdAt": "2023-09-01T10:30:00Z",
    "updatedAt": "2023-09-01T10:30:00Z"
  }
}
```

#### POST `/capsules`
Create a new capsule.

**Request Body:**
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
  },
  "recipients": [
    {
      "email": "family@example.com",
      "name": "Family Member",
      "relationship": "family",
      "accessLevel": "view"
    }
  ],
  "privacy": {
    "visibility": "private"
  },
  "category": "personal",
  "tags": ["memory", "family"]
}
```

**Response:**
```json
{
  "message": "Capsule created successfully",
  "capsule": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "title": "My Memory",
    "description": "A special moment",
    "status": "draft",
    "createdAt": "2023-09-01T10:30:00Z"
  }
}
```

#### PUT `/capsules/:id`
Update an existing capsule.

**Request Body:**
```json
{
  "title": "Updated Memory",
  "description": "Updated description",
  "category": "family"
}
```

#### DELETE `/capsules/:id`
Delete a capsule.

**Response:**
```json
{
  "message": "Capsule deleted successfully"
}
```

#### POST `/capsules/:id/unlock`
Manually unlock a capsule (only for manual unlock type).

**Response:**
```json
{
  "message": "Capsule unlocked successfully",
  "capsule": {...}
}
```

#### GET `/capsules/:id/content`
Get decrypted capsule content (only if unlocked).

**Response:**
```json
{
  "content": {
    "type": "text",
    "text": "This is my decrypted memory...",
    "files": [],
    "metadata": {
      "tags": ["memory", "family"]
    }
  }
}
```

#### POST `/capsules/:id/recipients`
Add a recipient to a capsule.

**Request Body:**
```json
{
  "email": "friend@example.com",
  "name": "Friend Name",
  "relationship": "friend",
  "accessLevel": "view"
}
```

#### GET `/capsules/:id/analytics`
Get capsule analytics and insights.

**Response:**
```json
{
  "analytics": {
    "views": 5,
    "lastAccessed": "2023-09-01T10:30:00Z",
    "age": 86400000,
    "daysUntilUnlock": 115,
    "aiAnalysis": {
      "emotion": {
        "primary": "joy",
        "confidence": 0.85
      },
      "sentiment": {
        "score": 0.7
      },
      "topics": ["family", "memory"]
    },
    "accessLog": [
      {
        "user": "64f8a1b2c3d4e5f6a7b8c9d0",
        "action": "view",
        "timestamp": "2023-09-01T10:30:00Z",
        "ipAddress": "192.168.1.1"
      }
    ]
  }
}
```

### AI Services

#### POST `/ai/analyze`
Analyze content with AI for emotion and sentiment.

**Request Body:**
```json
{
  "content": "I'm so happy today!",
  "type": "text"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "content_type": "text",
    "timestamp": "2023-09-01T10:30:00Z",
    "emotion": {
      "primary_emotion": "joy",
      "secondary_emotion": "optimism",
      "confidence": 0.92,
      "emotions": {
        "joy": 0.92,
        "optimism": 0.78,
        "love": 0.65
      },
      "sentiment": {
        "compound": 0.85,
        "positive": 0.90,
        "negative": 0.05,
        "neutral": 0.05
      },
      "category": "positive",
      "intensity": "high"
    },
    "classification": {
      "category": "personal",
      "topic": "celebration",
      "priority": "medium",
      "confidence": {
        "category": 0.88,
        "topic": 0.82,
        "priority": 0.75
      },
      "keywords": ["happy", "today"],
      "tags": ["personal", "celebration", "emotion_happy"]
    }
  }
}
```

#### GET `/ai/recommendations/:userId`
Get personalized recommendations for a user.

**Query Parameters:**
- `preferences` (optional): User preferences JSON string

**Response:**
```json
{
  "success": true,
  "recommendations": {
    "unlock_suggestions": [
      {
        "capsule_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "suggested_date": "2024-01-01T00:00:00Z",
        "reason": "Based on emotional content analysis",
        "confidence": 0.85
      }
    ],
    "content_suggestions": [
      {
        "type": "memory_capsule",
        "description": "Create a memory capsule for special moments",
        "reason": "High emotional content detected in recent capsules"
      }
    ],
    "sharing_suggestions": [
      {
        "capsule_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "suggested_recipients": ["family@example.com"],
        "reason": "Family-related content detected"
      }
    ]
  }
}
```

#### POST `/ai/insights/:capsuleId`
Generate AI insights for a specific capsule.

**Request Body:**
```json
{
  "capsule": {
    "content": {
      "type": "text",
      "text": "This is my memory..."
    },
    "unlock_conditions": {
      "type": "date",
      "unlock_date": "2024-12-25T00:00:00Z"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "insights": {
    "capsule_id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "timestamp": "2023-09-01T10:30:00Z",
    "content_analysis": {
      "emotion": {...},
      "classification": {...}
    },
    "unlock_recommendations": [
      {
        "suggested_date": "2024-12-24T00:00:00Z",
        "reason": "Day before Christmas for better emotional impact",
        "confidence": 0.78
      }
    ],
    "sharing_suggestions": [
      {
        "recipients": ["family@example.com"],
        "reason": "Family-related content detected",
        "confidence": 0.85
      }
    ]
  }
}
```

### File Upload

#### POST `/upload/file`
Upload a single file.

**Request:** Multipart form data with `file` field

**Response:**
```json
{
  "success": true,
  "file": {
    "filename": "encrypted_filename_123",
    "originalName": "photo.jpg",
    "mimeType": "image/jpeg",
    "size": 1024000,
    "path": "/uploads/encrypted_filename_123",
    "encrypted": true
  }
}
```

#### POST `/upload/multiple`
Upload multiple files.

**Request:** Multipart form data with multiple `files` fields

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "filename": "encrypted_filename_123",
      "originalName": "photo1.jpg",
      "mimeType": "image/jpeg",
      "size": 1024000,
      "path": "/uploads/encrypted_filename_123",
      "encrypted": true
    },
    {
      "filename": "encrypted_filename_124",
      "originalName": "photo2.jpg",
      "mimeType": "image/jpeg",
      "size": 2048000,
      "path": "/uploads/encrypted_filename_124",
      "encrypted": true
    }
  ]
}
```

## Error Responses

All error responses follow this format:

```json
{
  "message": "Error description",
  "error": "Detailed error information (development only)",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

### Example Error Response

```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters long"
    }
  ]
}
```

## Rate Limiting

API requests are rate limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute per IP
- **General API endpoints**: 100 requests per 15 minutes per IP
- **File upload endpoints**: 10 requests per minute per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## WebSocket Events

### Real-time Updates

Connect to WebSocket endpoint for real-time updates:

```
ws://localhost:5000/ws?token=<jwt-token>
```

#### Events

**capsule.unlocked**
```json
{
  "event": "capsule.unlocked",
  "data": {
    "capsuleId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "title": "My Memory",
    "unlockedAt": "2023-09-01T10:30:00Z"
  }
}
```

**ai.analysis.complete**
```json
{
  "event": "ai.analysis.complete",
  "data": {
    "capsuleId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "analysis": {
      "emotion": {...},
      "classification": {...}
    }
  }
}
```

## SDKs and Libraries

### JavaScript/Node.js
```bash
npm install soulsafe-ai-sdk
```

```javascript
import SoulSafe from 'soulsafe-ai-sdk';

const client = new SoulSafe({
  apiKey: 'your-api-key',
  baseURL: 'https://api.soulsafe.ai'
});

// Create a capsule
const capsule = await client.capsules.create({
  title: 'My Memory',
  content: { type: 'text', text: 'Hello world' },
  unlockConditions: { type: 'date', unlockDate: '2024-12-25' }
});
```

### Python
```bash
pip install soulsafe-ai
```

```python
from soulsafe import SoulSafeClient

client = SoulSafeClient(api_key='your-api-key')

# Create a capsule
capsule = client.capsules.create(
    title='My Memory',
    content={'type': 'text', 'text': 'Hello world'},
    unlock_conditions={'type': 'date', 'unlock_date': '2024-12-25'}
)
```

## Support

For API support and questions:
- **Email**: api-support@soulsafe.ai
- **Documentation**: https://docs.soulsafe.ai
- **Status Page**: https://status.soulsafe.ai
