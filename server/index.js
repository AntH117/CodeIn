import app from './server.js'
// import CodeInDAO from './dao/codeinDAO.js'
import mongodb from 'mongodb'
import dotenv from 'dotenv';
dotenv.config();

const MongoClient = mongodb.MongoClient
// environment variables, safer to store
const mongo_username = process.env.MONGO_USERNAME
const mongo_password = process.env.MONGO_PASSWORD

const uri = `mongodb+srv://${mongo_username}:${mongo_password}@cluster0.xkjth1q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

const PORT = 5000;

//connect to database
MongoClient.connect(
    uri,
    {
        //Max connection limit
        maxPoolSize: 50,
        //Connection attempt timeout threshold
        wtimeoutMS: 2500,
        useNewUrlParser: true,

    })
    //Catching errors
    .catch(err => {
        console.error(err.stack)
        //exiting the process
        process.exit(1)
    })
    // After connection
    .then(async client => {
        //start the server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        });
    })
