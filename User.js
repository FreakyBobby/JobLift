const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class User {
    constructor({ name, email, password, role, phone }) {
        this.id = crypto.randomBytes(16).toString('hex');
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.phone = phone;
        this.createdAt = new Date();
        this.isEmailVerified = false;
        this.resetPasswordToken = null;
        this.resetPasswordExpires = null;
    }

    async hashPassword() {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }

    async comparePassword(candidatePassword) {
        return await bcrypt.compare(candidatePassword, this.password);
    }

    generateAuthToken() {
        return jwt.sign(
            { id: this.id, role: this.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );
    }

    generatePasswordResetToken() {
        const resetToken = crypto.randomBytes(20).toString('hex');
        this.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        this.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        return resetToken;
    }
}

// In-memory storage
const users = new Map();

// Helper functions
const findUserByEmail = (email) => {
    for (const user of users.values()) {
        if (user.email === email) {
            return user;
        }
    }
    return null;
};

const findUserById = (id) => {
    return users.get(id);
};

const saveUser = async (user) => {
    await user.hashPassword();
    users.set(user.id, user);
    return user;
};

module.exports = {
    User,
    findUserByEmail,
    findUserById,
    saveUser
}; 