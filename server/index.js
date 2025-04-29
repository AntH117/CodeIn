const express = require('express');
const app = express();
const PORT = 5000;
// to parse JSON
app.use(express.json());

// Load routes
const userRoute = require('./routes/users');
// Mount routes
app.use('/api/users', userRoute)

app.get('/', (req, res) => {
  res.send('Home Page');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});