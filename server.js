// server/server.js
const express = require('express');
const connectDB = require('./config/db');
const cors = require("cors");
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const carRoutes = require('./routes/carRoutes');
const http = require('http');
const { initSocket } = require('./config/socket');


dotenv.config();

const corsOptions = {
    //origin: 'https://www.daeds.uk', 
    origin: 'http://localhost:5173', 
    credentials: true,
  };
  

const app = express();
app.use(cors(corsOptions));
const server = http.createServer(app);
const io = initSocket(server);

// Connect Database
connectDB();


// Init Middleware
app.use(express.json({ extended: false }));

app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes); 

 
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));

 
