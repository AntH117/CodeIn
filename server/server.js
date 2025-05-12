//Express framework && Port
const express = require('express');
const app = express();
const PORT = 5000;

// to parse JSON && load cors
app.use(cors())
app.use(express.json());

// Load routes
const userRoute = require('./routes/users');

// Mount routes
app.use('/api/v1/users', userRoute)
app.use("*", (req, res) => {res.status(404).json({error: "not found"})})

// Requests
app.get('/', (req, res) => {
  res.send('Home Page');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});

export default app