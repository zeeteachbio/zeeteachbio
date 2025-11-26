// Auth Service - Backend Integration

export const authService = {
    // Sign Up
    async signUp(name, email, password) {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Sign up failed');
        return data;
    },

    // Verify Email
    async verifyEmail(email, code) {
        const response = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Verification failed');
        return data;
    },

    // Sign In
    async signIn(email, password) {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Login failed');
        return data;
    },

    // Password Reset (Request) - Mock implementation as backend doesn't support it yet
    async requestPasswordReset(email) {
        // For now, we still simulate this part or we could add a route later
        // Just return success to keep UI working
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true, message: 'If an account exists, a reset code has been sent.', resetCode: '123456' };
    },

    // Password Reset (Confirm) - Mock implementation
    async resetPassword(email, code, newPassword) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true, message: 'Password updated successfully.' };
    }
};
