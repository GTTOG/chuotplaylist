// Backend Server - Device-Locked Account System (Vercel Serverless)
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));

// Database path - use /tmp for temporary storage (loses data on redeploy)
// For production, use environment variable for database URL (MongoDB, Supabase, Firebase)
const DB_TYPE = process.env.DB_TYPE || 'file'; // 'file' or 'mongodb'
const dbPath = path.join('/tmp', 'users_db.json');

// In-memory fallback database
let inMemoryDB = { users: [] };

// Initialize database
function initializeDatabase() {
    if (DB_TYPE === 'file') {
        try {
            if (fs.existsSync(dbPath)) {
                const data = fs.readFileSync(dbPath, 'utf8');
                inMemoryDB = JSON.parse(data);
            }
        } catch (error) {
            console.log('Using in-memory database (fallback)');
            inMemoryDB = { users: [] };
        }
    }
}

// Read database
function readDatabase() {
    try {
        if (DB_TYPE === 'file') {
            if (fs.existsSync(dbPath)) {
                const data = fs.readFileSync(dbPath, 'utf8');
                return JSON.parse(data);
            }
        }
        return inMemoryDB;
    } catch (error) {
        console.error('Error reading database:', error);
        return { users: [] };
    }
}

// Write database
function writeDatabase(data) {
    try {
        inMemoryDB = data;
        if (DB_TYPE === 'file') {
            fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
        }
        return true;
    } catch (error) {
        console.error('Error writing database:', error);
        inMemoryDB = data; // At least keep in memory
        return false;
    }
}

// Hash password
async function hashPassword(password) {
    return bcrypt.hash(password, 10);
}

// Verify password
async function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// GET - Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'Server is running',
        environment: process.env.NODE_ENV || 'development',
        dbType: DB_TYPE
    });
});

// POST - Register new account
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password, deviceId, deviceName } = req.body;

        // Validation
        if (!username || !email || !password || !deviceId) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const db = readDatabase();

        // Check if username exists
        const existingUser = db.users.find(u => u.username === username);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }

        // Check if email exists
        const existingEmail = db.users.find(u => u.email === email);
        if (existingEmail) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create new user with device binding
        const newUser = {
            id: generateId(),
            username: username,
            email: email,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            registeredDevice: {
                deviceId: deviceId,
                deviceName: deviceName || 'Unknown Device',
                registeredAt: new Date().toISOString()
            },
            allowedDevices: [deviceId],
            tracks: [],
            likedTracks: [],
            playlists: [],
            preferences: {
                volume: 70,
                loopEnabled: false
            },
            profile: {
                displayName: username,
                bio: 'Welcome to xiecchuot player!',
                avatar: '👤',
                socialMedia: {
                    twitter: '',
                    instagram: '',
                    youtube: ''
                }
            },
            downloadedTracks: [],
            followers: [],
            following: []
        };

        db.users.push(newUser);
        writeDatabase(db);

        res.json({
            success: true,
            message: 'Account created successfully',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// POST - Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password, deviceId, deviceName } = req.body;

        // Validation
        if (!username || !password || !deviceId) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const db = readDatabase();
        const user = db.users.find(u => u.username === username);

        // Check if user exists
        if (!user) {
            return res.status(401).json({ success: false, message: 'Username not found' });
        }

        // Verify password
        const passwordValid = await verifyPassword(password, user.password);
        if (!passwordValid) {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }

        // Check device binding
        if (!user.allowedDevices || !user.allowedDevices.includes(deviceId)) {
            return res.status(403).json({
                success: false,
                message: 'This account can only be accessed from the device where it was registered',
                allowedDevice: user.registeredDevice.deviceName,
                deviceUnauthorized: true
            });
        }

        // Login successful
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                profile: user.profile,
                preferences: user.preferences
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// GET - Get user data
app.get('/api/user/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const db = readDatabase();
        const user = db.users.find(u => u.id === userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const { password, ...userWithoutPassword } = user;
        res.json({ success: true, user: userWithoutPassword });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PUT - Update user data
app.put('/api/user/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;

        const db = readDatabase();
        const userIndex = db.users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Don't allow password or device updates via this endpoint
        delete updates.password;
        delete updates.allowedDevices;
        delete updates.registeredDevice;

        db.users[userIndex] = { ...db.users[userIndex], ...updates };
        writeDatabase(db);

        const { password, ...userWithoutPassword } = db.users[userIndex];
        res.json({ success: true, user: userWithoutPassword });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Handle preflight requests
app.options('*', cors());

// Initialize database
initializeDatabase();

module.exports = app;
