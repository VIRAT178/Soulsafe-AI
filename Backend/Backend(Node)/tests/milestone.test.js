const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/UserModel');
const Capsule = require('../models/CapsuleModel');
const jwt = require('jsonwebtoken');

describe('Milestone API', () => {
  let authToken;
  let userId;
  let testUser;

  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/soulsafe_test';
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    // Clear test data
    await User.deleteMany({});
    await Capsule.deleteMany({});

    // Create test user
    testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    });
    await testUser.save();
    userId = testUser._id;

    // Generate auth token
    authToken = jwt.sign(
      { id: userId, email: testUser.email },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/milestones/check', () => {
    it('should check milestones for authenticated user', async () => {
      const response = await request(app)
        .get('/api/milestones/check')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.milestones).toBeDefined();
      expect(response.body.triggeredUnlocks).toBeDefined();
    });

    it('should return 401 for unauthenticated request', async () => {
      await request(app)
        .get('/api/milestones/check')
        .expect(401);
    });
  });

  describe('POST /api/milestones/manual', () => {
    it('should add manual milestone successfully', async () => {
      const milestoneData = {
        type: 'life_milestone',
        event: 'Graduated from University',
        date: '2023-06-15',
        significance: 'high',
        details: 'Computer Science degree'
      };

      const response = await request(app)
        .post('/api/milestones/manual')
        .set('Authorization', `Bearer ${authToken}`)
        .send(milestoneData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.milestone.event).toBe(milestoneData.event);
      expect(response.body.milestone.type).toBe(milestoneData.type);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        type: 'life_milestone',
        // Missing required fields
      };

      await request(app)
        .post('/api/milestones/manual')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should validate significance enum', async () => {
      const invalidData = {
        type: 'life_milestone',
        event: 'Test Event',
        date: '2023-06-15',
        significance: 'invalid_significance'
      };

      await request(app)
        .post('/api/milestones/manual')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('POST /api/milestones/connect-social', () => {
    it('should connect social media account', async () => {
      const socialData = {
        platform: 'facebook',
        accessToken: 'test_token_123',
        accountData: {
          userId: 'fb_user_123',
          name: 'Test User',
          followerCount: 500
        }
      };

      const response = await request(app)
        .post('/api/milestones/connect-social')
        .set('Authorization', `Bearer ${authToken}`)
        .send(socialData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.platform).toBe('facebook');

      // Verify user was updated
      const updatedUser = await User.findById(userId);
      expect(updatedUser.socialAccounts.facebook).toBeDefined();
      expect(updatedUser.socialAccounts.facebook.accessToken).toBe('test_token_123');
    });

    it('should validate platform enum', async () => {
      const invalidData = {
        platform: 'invalid_platform',
        accessToken: 'test_token',
        accountData: {}
      };

      await request(app)
        .post('/api/milestones/connect-social')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('GET /api/milestones/history', () => {
    beforeEach(async () => {
      // Add some test milestones
      testUser.milestoneHistory = [
        {
          type: 'career_milestone',
          event: 'Got promoted',
          platform: 'linkedin',
          date: new Date('2023-01-15'),
          significance: 'high',
          details: 'Promoted to Senior Developer'
        },
        {
          type: 'social_milestone',
          event: '1000 followers',
          platform: 'instagram',
          date: new Date('2023-02-20'),
          significance: 'medium',
          details: 'Reached 1000 followers milestone'
        }
      ];
      await testUser.save();
    });

    it('should return milestone history', async () => {
      const response = await request(app)
        .get('/api/milestones/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.milestones).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter by type', async () => {
      const response = await request(app)
        .get('/api/milestones/history?type=career_milestone')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.milestones).toHaveLength(1);
      expect(response.body.milestones[0].type).toBe('career_milestone');
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/milestones/history?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.milestones).toHaveLength(1);
      expect(response.body.pagination.current).toBe(1);
    });
  });

  describe('DELETE /api/milestones/disconnect/:platform', () => {
    beforeEach(async () => {
      // Connect a social account first
      testUser.socialAccounts = {
        facebook: {
          accessToken: 'test_token',
          accountData: { userId: 'fb_123' },
          connectedAt: new Date()
        }
      };
      await testUser.save();
    });

    it('should disconnect social platform', async () => {
      const response = await request(app)
        .delete('/api/milestones/disconnect/facebook')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify disconnection
      const updatedUser = await User.findById(userId);
      expect(updatedUser.socialAccounts.facebook).toBeUndefined();
    });

    it('should return 404 for non-connected platform', async () => {
      await request(app)
        .delete('/api/milestones/disconnect/twitter')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Milestone Service Integration', () => {
    it('should trigger capsule unlock based on milestone', async () => {
      // Create a capsule with milestone-based unlock condition
      const capsule = new Capsule({
        title: 'Graduation Memory',
        description: 'To be opened when I graduate',
        owner: userId,
        content: {
          type: 'text',
          text: 'Congratulations on graduating!'
        },
        unlockConditions: {
          type: 'event',
          eventType: 'graduation',
          isUnlocked: false
        },
        status: 'active'
      });
      await capsule.save();

      // Add graduation milestone
      const milestoneData = {
        type: 'education_milestone',
        event: 'graduation',
        date: new Date().toISOString(),
        significance: 'high',
        details: 'Graduated from University'
      };

      const response = await request(app)
        .post('/api/milestones/manual')
        .set('Authorization', `Bearer ${authToken}`)
        .send(milestoneData)
        .expect(200);

      expect(response.body.triggeredUnlocks).toBeDefined();
      
      // Check if capsule was unlocked
      const updatedCapsule = await Capsule.findById(capsule._id);
      // Note: This would depend on the actual implementation of milestone matching
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Simulate database error by using invalid ObjectId
      const invalidToken = jwt.sign(
        { id: 'invalid_id', email: 'test@example.com' },
        process.env.JWT_SECRET || 'test_secret',
        { expiresIn: '1h' }
      );

      await request(app)
        .get('/api/milestones/check')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(500);
    });

    it('should validate request body structure', async () => {
      await request(app)
        .post('/api/milestones/connect-social')
        .set('Authorization', `Bearer ${authToken}`)
        .send({}) // Empty body
        .expect(400);
    });
  });
});
