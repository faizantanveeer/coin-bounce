const express = require('express');
const dbConnect = require('./database/index.js');
const {PORT} = require('./config/index.js');
const router = require('./routes/index.js');
const errorHandler = require('./middleware/errorhandler.js');
const cookieParser = require('cookie-parser')
const cors = require('cors');

const corsOrigin ={
    origin:'http://localhost:3000', //or whatever port your frontend is using
    credentials:true,            
}



const app = express();



app.use(cookieParser());
 
app.use(cors(corsOrigin));

app.use(express.json({limit: '50mb'}));

app.use(router);

dbConnect();

app.use('/storage', express.static('storage'));

app.use(errorHandler);

app.listen(PORT, console.log(`Backend is running on port: ${PORT}`));