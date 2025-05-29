import mongoose from "mongoose";
import express from "express";
import userroutes from './routes/userroutes.js';
import message from './routes/messageroutes.js';
import cors from 'cors';
import cookieParser from "cookie-parser";
import { app, server } from "./server.js";
import path from 'path';
import dotenv from 'dotenv';


dotenv.config();


mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.log("Error Coonecting", err.message);
}); 

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'https://chatapp-frontend-lemon.vercel.app',
    credentials: true
}));


app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

app.use('/userroute12', userroutes);
app.use('/messages', message);

app.get('/', (req, res) => {
    res.send('Chat server is running');
});

server.listen(4000, () => {
    console.log('Server is running on port 4000');
});
