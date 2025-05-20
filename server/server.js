import express from 'express'
import cors from 'cors'
import path from 'path';
import { fileURLToPath } from 'url';
//Express framework && Port
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import router from './routes/codeIn.route.js';

// to parse JSON && load cors
app.use(cors())
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Mount routes
app.use('/api/v1/codeIn', router)
app.use('/uploads/final', express.static(path.join(__dirname, 'uploads/final')));
app.use((req, res) => {res.status(404).json({error: "not found"})})
export default app