import express from 'express'
import cors from 'cors'
//Express framework && Port
const app = express();
import router from './routes/codeIn.route.js';

// to parse JSON && load cors
app.use(cors())
app.use(express.json());

// Mount routes
app.use('/api/v1/codeIn', router)
app.use((req, res) => {res.status(404).json({error: "not found"})})


export default app