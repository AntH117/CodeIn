import express from 'express'
import cors from 'cors'
import path from 'path';
import { fileURLToPath } from 'url';
//Express framework && Port
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import codeInRouter from './routes/codeIn.route.js';
import commentsRouter from './routes/comments.route.js'

// to parse JSON && load cors
app.use(cors())
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Mount routes
app.use('/api/v1/codeIn', codeInRouter)
app.use('/api/v1/comments', commentsRouter)
app.use('/uploads/final', express.static(path.join(__dirname, 'uploads/final')));
app.use('/uploads/temp', express.static(path.join(__dirname, 'uploads/temp')));
app.use((req, res) => {res.status(404).json({error: "not found"})})

export default app