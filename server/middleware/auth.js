const jwt = require('jsonwebtoken');
const Capsule = require('../models/CapsuleModel');

// Simple auth middleware for development/testing
const authMiddleware = (req, res, next) => {
	try {
		// In development, allow bypass with a query param ?devUser=1
		if (req.query && req.query.devUser === '1') {
			req.user = { _id: '000000000000000000000000', username: 'dev' };
			return next();
		}

		const authHeader = req.headers.authorization || '';
		const token = authHeader.replace(/^Bearer\s+/i, '');
		if (!token) return res.status(401).json({ message: 'Unauthorized' });

		try {
			const JWT_SECRET = process.env.JWT_SECRET || 'soulsafe-super-secret-jwt-key-2023';
			const payload = jwt.verify(token, JWT_SECRET);
			// Support both 'userId' and 'sub' properties for backward compatibility
			req.user = { _id: payload.userId || payload.sub, username: payload.username };
			return next();
		} catch (err) {
			console.error('Token verification failed:', err.message);
			return res.status(401).json({ message: 'Invalid token' });
		}
	} catch (err) {
		console.error('Auth middleware error:', err);
		return res.status(500).json({ message: 'Auth error' });
	}
};

// Validate capsule ownership middleware
const validateCapsuleOwnership = async (req, res, next) => {
	try {
		const capsuleId = req.params.id || req.body.id;
		if (!capsuleId) return res.status(400).json({ message: 'Capsule id required' });

		const capsule = await Capsule.findById(capsuleId);
		if (!capsule) return res.status(404).json({ message: 'Capsule not found' });

		// Allow if user is owner or in dev mode
		if (req.user && (String(capsule.owner) === String(req.user._id) || req.query.devUser === '1')) {
			req.capsule = capsule;
			return next();
		}

		return res.status(403).json({ message: 'Forbidden' });
	} catch (err) {
		console.error('Ownership validation failed', err);
		return res.status(500).json({ message: 'Ownership validation error' });
	}
};

// Simple activity logger
const logActivity = (action) => (req, res, next) => {
	// For now, just attach to request and continue
	req.activity = { action, timestamp: new Date() };
	next();
};

module.exports = { authMiddleware, validateCapsuleOwnership, logActivity };
