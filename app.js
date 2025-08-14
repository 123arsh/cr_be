require('dotenv').config()
const express = require('express');
const { connectMongoDB } = require('./connection');
const app = express();
const PORT = process.env.PORT || 7700;
const path = require('path');
const userRoute = require('./routes/user_route');
const carRoute = require('./routes/cars_Data');
const detail = require('./routes/details');
const ratingRoute = require('./routes/rating');
const cookieParser = require('cookie-parser');
const adminRoute = require('./routes/admin');

const cors = require('cors');

/*middlewares*/
app.use(express.urlencoded({ extended: false }));

// Configure CORS with specific options
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5174',
        process.env.FRONTEND_URL // Add your frontend URL from environment variable
    ].filter(Boolean), // Remove undefined values
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 600
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.resolve('./public')));
// app.use('/carImages', express.static(path.join(__dirname, 'public/carImages')));

/*Routes*/
app.use('/', userRoute);
app.use('/car', carRoute);
app.use('/detail', detail);
app.use('/api/ratings', ratingRoute);
app.use('/api/admin', adminRoute);

/*Database Connection*/
connectMongoDB(process.env.mongoDb)
.then(()=> console.log('Database has been connected'))
.catch(()=> console.log('Problem with connecting database'));

/*Server Connection setup*/
app.listen(PORT, ()=>{
    console.log(`Server has been established at port number : ${PORT}`);
})