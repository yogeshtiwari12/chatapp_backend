import express from 'express';
import { login, logout, signup, users, valid_user } from '../methods/user.js';
import { verifytoken } from '../auth/auth.js';
const route = express.Router();
route.put('/signup',signup)
route.post('/login',login)
route.post('/logout',verifytoken,logout)
route.get('/getauthuser',verifytoken,valid_user)
route.get('/users',verifytoken,users)



export default route;

