// Simulated Auth Service
// Handles user management, mock database, and verification

const DB_KEY = 'zeeteach_users';

class UserDatabase {
    constructor() {
        this.users = JSON.parse(localStorage.getItem(DB_KEY)) || [];
    }

    save() {
        localStorage.setItem(DB_KEY, JSON.stringify(this.users));
    }

    findUserByEmail(email) {
        return this.users.find(u => u.email === email);
    }

    createUser(user) {
        this.users.push(user);
        this.save();
    }

    updateUser(email, updates) {
        const user = this.findUserByEmail(email);
        if (user) {
            Object.assign(user, updates);
            this.save();
            return user;
        }
        return null;
    }
}

const db = new UserDatabase();

export const authService = {
    // Sign Up
    async signUp(name, email, password) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        if (db.findUserByEmail(email)) {
            throw new Error('Email already registered');
        }

        // Generate verification code (6 digits)
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password: btoa(password), // Simple encoding for mock (NOT SECURE for production)
            verified: false,
            verificationCode,
            createdAt: new Date().toISOString()
        };

        db.createUser(newUser);

        // In a real app, this would send an email.
        // For simulation, we'll log it and return it to be shown in an alert.
        console.log(`[AuthService] Verification code for ${email}: ${verificationCode}`);

        return {
            success: true,
            message: 'Account created. Please verify your email.',
            verificationCode // Returning this just for the demo alert
        };
    },

    // Verify Email
    async verifyEmail(email, code) {
        await new Promise(resolve => setTimeout(resolve, 600));

        const user = db.findUserByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }

        if (user.verified) {
            return { success: true, message: 'Email already verified' };
        }

        if (user.verificationCode === code) {
            db.updateUser(email, { verified: true, verificationCode: null });
            return { success: true, message: 'Email verified successfully' };
        } else {
            throw new Error('Invalid verification code');
        }
    },

    // Sign In
    async signIn(email, password) {
        await new Promise(resolve => setTimeout(resolve, 800));

        const user = db.findUserByEmail(email);

        if (!user) {
            throw new Error('Invalid email or password');
        }

        if (user.password !== btoa(password)) {
            throw new Error('Invalid email or password');
        }

        if (!user.verified) {
            // Resend code if trying to login without verification
            const newCode = Math.floor(100000 + Math.random() * 900000).toString();
            db.updateUser(email, { verificationCode: newCode });
            console.log(`[AuthService] New verification code for ${email}: ${newCode}`);

            throw new Error('Email not verified. A new code has been sent.');
        }

        return {
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        };
    },

    // Password Reset (Request)
    async requestPasswordReset(email) {
        await new Promise(resolve => setTimeout(resolve, 600));

        const user = db.findUserByEmail(email);
        if (!user) {
            // For security, don't reveal if user exists, but for mock we can just say sent
            return { success: true, message: 'If an account exists, a reset code has been sent.' };
        }

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        // Store reset code (in a real app, this would be in a separate table with expiry)
        db.updateUser(email, { resetCode });

        console.log(`[AuthService] Password reset code for ${email}: ${resetCode}`);
        return { success: true, message: 'Reset code sent to your email.', resetCode };
    },

    // Password Reset (Confirm)
    async resetPassword(email, code, newPassword) {
        await new Promise(resolve => setTimeout(resolve, 800));

        const user = db.findUserByEmail(email);
        if (!user || user.resetCode !== code) {
            throw new Error('Invalid reset code');
        }

        db.updateUser(email, {
            password: btoa(newPassword),
            resetCode: null
        });

        return { success: true, message: 'Password updated successfully.' };
    }
};
