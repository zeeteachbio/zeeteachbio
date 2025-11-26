import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());

// Helper to read DB
const readDb = () => {
    if (!fs.existsSync(DB_FILE)) {
        return { users: [], questions: [] };
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
};

// Helper to write DB
const writeDb = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// --- AUTH ROUTES ---

app.post('/api/auth/signup', (req, res) => {
    const { name, email, password } = req.body;
    const db = readDb();

    if (db.users.find(u => u.email === email)) {
        return res.status(400).json({ message: 'Email already registered' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password: btoa(password), // Simple encoding (NOT SECURE for production)
        verified: false,
        verificationCode,
        createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    writeDb(db);

    console.log(`[Server] Verification code for ${email}: ${verificationCode}`);
    res.json({ success: true, message: 'Account created', verificationCode });
});

app.post('/api/auth/verify', (req, res) => {
    const { email, code } = req.body;
    const db = readDb();
    const user = db.users.find(u => u.email === email);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.verified) return res.json({ success: true, message: 'Already verified' });

    if (user.verificationCode === code) {
        user.verified = true;
        user.verificationCode = null;
        writeDb(db);
        res.json({ success: true, message: 'Email verified' });
    } else {
        res.status(400).json({ message: 'Invalid code' });
    }
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const db = readDb();
    const user = db.users.find(u => u.email === email);

    if (!user || user.password !== btoa(password)) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.verified) {
        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationCode = newCode;
        writeDb(db);
        console.log(`[Server] New verification code for ${email}: ${newCode}`);
        return res.status(403).json({ message: 'Not verified', verificationCode: newCode });
    }

    res.json({
        success: true,
        user: { id: user.id, name: user.name, email: user.email }
    });
});

// --- FORUM ROUTES ---

app.get('/api/questions', (req, res) => {
    const db = readDb();
    res.json(db.questions);
});

app.get('/api/questions/:id', (req, res) => {
    const db = readDb();
    const question = db.questions.find(q => q.id === req.params.id);
    if (question) res.json(question);
    else res.status(404).json({ message: 'Question not found' });
});

app.post('/api/questions', (req, res) => {
    const { title, content, author } = req.body;
    const db = readDb();

    const newQuestion = {
        id: Date.now().toString(),
        title,
        content,
        author,
        date: new Date().toISOString(),
        answers: []
    };

    db.questions.unshift(newQuestion);
    writeDb(db);
    res.json(newQuestion);
});

app.post('/api/questions/:id/answers', (req, res) => {
    const { content, author } = req.body;
    const db = readDb();
    const question = db.questions.find(q => q.id === req.params.id);

    if (!question) return res.status(404).json({ message: 'Question not found' });

    const newAnswer = {
        id: Date.now().toString(),
        content,
        author,
        date: new Date().toISOString()
    };

    question.answers.push(newAnswer);
    writeDb(db);
    res.json(newAnswer);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
