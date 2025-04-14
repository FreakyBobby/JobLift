require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const { User, findUserByEmail, findUserById, saveUser } = require('./User');
const { Job, Application } = require('./Job');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Authentication middleware
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            throw new Error('No authentication token');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = findUserById(decoded.id);
        
        if (!user) {
            throw new Error('User not found');
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate' });
    }
};

// User registration
app.post('/api/users/register', async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;

        // Check if user already exists
        const existingUser = findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Create new user
        const user = new User({
            name,
            email,
            password,
            role,
            phone
        });

        await saveUser(user);

        // Generate token
        const token = user.generateAuthToken();

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// User login
app.post('/api/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate token
        const token = user.generateAuthToken();

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user profile
app.get('/api/users/profile', auth, async (req, res) => {
    try {
        const user = findUserById(req.user.id);
        if (!user) {
            throw new Error('User not found');
        }

        // Remove sensitive data
        const { password, resetPasswordToken, resetPasswordExpires, ...userData } = user;
        res.json(userData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update user profile
app.put('/api/users/profile', auth, async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['name', 'email', 'phone'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates' });
        }

        const user = findUserById(req.user.id);
        if (!user) {
            throw new Error('User not found');
        }

        updates.forEach(update => user[update] = req.body[update]);
        users.set(user.id, user);

        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Change password
app.put('/api/users/change-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = findUserById(req.user.id);
        if (!user) {
            throw new Error('User not found');
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.hashPassword();
        users.set(user.id, user);

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Protected routes
app.get('/api/jobs', auth, async (req, res) => {
    try {
        const jobs = await Job.find();
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/jobs', auth, async (req, res) => {
    try {
        const job = new Job(req.body);
        await job.save();
        res.status(201).json(job);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get('/api/applications', auth, async (req, res) => {
    try {
        const applications = await Application.find({ userId: req.user.id });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Check if user is authenticated
app.get('/api/auth/check', auth, (req, res) => {
    res.json({ authenticated: true, user: req.user });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 