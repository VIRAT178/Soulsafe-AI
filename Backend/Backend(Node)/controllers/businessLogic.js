const Capsule = require('../models/CapsuleModel');
const encryptionService = require('../services/encryption');
const crypto = require('crypto');

// Capsule operations
const getAllCapsules = async (userId, filters = {}) => {
    try {
        const query = { owner: userId, ...filters };
        return await Capsule.find(query).populate('owner', 'username firstName lastName');
    } catch (error) {
        throw new Error('Error fetching capsules: ' + error.message);
    }
};

const createCapsule = async (capsuleData, userId) => {
    try {
        let capsuleContent = capsuleData.content;
        // If content is a string (from FormData), wrap it in the expected object
        if (typeof capsuleContent === 'string') {
            capsuleContent = {
                type: 'text',
                text: capsuleContent
            };
        }
        
        // Calculate total size from files if present
        let totalSize = 0;
        if (capsuleContent.files && Array.isArray(capsuleContent.files)) {
            totalSize = capsuleContent.files.reduce((sum, file) => sum + (file.size || 0), 0);
        }
        
        // Encrypt text if present
        let encryptionKey;
        if (capsuleContent.text) {
            encryptionKey = crypto.randomBytes(32); // Generate a random key
            const encrypted = encryptionService.encryptText(capsuleContent.text, encryptionKey);
            capsuleContent.text = encrypted.encrypted;
            capsuleContent.iv = encrypted.iv;
            capsuleContent.tag = encrypted.tag;
        }
        
        // Set up privacy settings
        if (!capsuleData.privacy) capsuleData.privacy = {};
        capsuleData.privacy.encryptionKey = encryptionKey ? encryptionKey.toString('hex') : crypto.randomBytes(32).toString('hex');
        capsuleData.privacy.visibility = capsuleData.privacy.visibility || 'private';
        capsuleData.privacy.accessLog = capsuleData.privacy.accessLog || [];
        
        // Handle encryptionLevel from frontend
        if (capsuleData.encryptionLevel) {
            capsuleData.privacy.encryptionLevel = capsuleData.encryptionLevel;
            delete capsuleData.encryptionLevel;
        } else {
            capsuleData.privacy.encryptionLevel = capsuleData.privacy.encryptionLevel || 'quantum';
        }
        
        // Combine unlockDate and unlockTime if provided separately
        if (capsuleData.unlockDate && capsuleData.unlockTime) {
            const combinedDateTime = `${capsuleData.unlockDate}T${capsuleData.unlockTime}:00`;
            if (capsuleData.unlockConditions) {
                capsuleData.unlockConditions.unlockDate = new Date(combinedDateTime);
            }
            delete capsuleData.unlockDate;
            delete capsuleData.unlockTime;
        }
        
        // Set default values for missing fields
        const capsuleDefaults = {
            status: capsuleData.status || 'draft',
            category: capsuleData.category || 'personal',
            tags: capsuleData.tags || [],
            recipients: capsuleData.recipients || [],
            size: totalSize,
            views: 0,
            aiAnalysis: {
                topics: [],
                keywords: [],
                ...(capsuleData.aiAnalysis || {})
            }
        };
        
        // Initialize content metadata and aiAnalysis if not present
        if (!capsuleContent.metadata) {
            capsuleContent.metadata = { tags: [] };
        }
        if (!capsuleContent.aiAnalysis) {
            capsuleContent.aiAnalysis = {
                emotions: [],
                contextualTags: []
            };
        }
        
        const capsule = new Capsule({
            ...capsuleDefaults,
            ...capsuleData,
            owner: userId,
            content: capsuleContent
        });
        console.log('[DEBUG] Capsule object created, about to save to DB...');
        console.log('[DEBUG] Capsule data:', { title: capsule.title, owner: capsule.owner, status: capsule.status });
        const savedCapsule = await capsule.save();
        console.log('[DEBUG] ✅ Capsule saved successfully to MongoDB:', savedCapsule._id);
        return savedCapsule;
    } catch (error) {
        console.error('[DEBUG] ❌ Error creating/saving capsule:', error.message);
        console.error('[DEBUG] Full error:', error);
        throw new Error('Error creating capsule: ' + error.message);
    }
};

const updateCapsule = async (capsuleId, updateData, userId) => {
    try {
        if (updateData.content) {
            updateData.content = await encryptionService.encrypt(updateData.content);
        }
        return await Capsule.findOneAndUpdate(
            { _id: capsuleId, owner: userId },
            updateData,
            { new: true }
        );
    } catch (error) {
        throw new Error('Error updating capsule: ' + error.message);
    }
};

const deleteCapsule = async (capsuleId, userId) => {
    try {
        return await Capsule.findOneAndDelete({ _id: capsuleId, owner: userId });
    } catch (error) {
        throw new Error('Error deleting capsule: ' + error.message);
    }
};

const getCapsuleById = async (capsuleId, userId) => {
    try {
        const capsule = await Capsule.findOne({ _id: capsuleId, owner: userId });
        if (!capsule) return null;
        
        // Decrypt text content if present and encrypted
        if (capsule.content && capsule.content.text && capsule.privacy && capsule.privacy.encryptionKey) {
            const encryptionKey = Buffer.from(capsule.privacy.encryptionKey, 'hex');
            const encryptedData = {
                encrypted: capsule.content.text,
                iv: capsule.content.iv,
                tag: capsule.content.tag
            };
            capsule.content.text = encryptionService.decryptText(encryptedData, encryptionKey);
        }
        return capsule;
    } catch (error) {
        throw new Error('Error fetching capsule: ' + error.message);
    }
};

module.exports = {
    getAllCapsules,
    createCapsule,
    updateCapsule,
    deleteCapsule,
    getCapsuleById
};
