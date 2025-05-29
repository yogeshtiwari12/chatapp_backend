import express from 'express';
import { getmessage, sendmesage, markMessagesAsRead, getUnreadCounts, upload } from '../methods/message.js';
import { verifytoken } from '../auth/auth.js';
const routes = express.Router();

routes.post('/sendmessage/:id', verifytoken, upload.single('file'), sendmesage);
routes.get('/getmesages/:id', verifytoken, getmessage);
routes.put('/markread/:senderId', verifytoken, markMessagesAsRead);
routes.get('/unreadcounts', verifytoken, getUnreadCounts);

export default routes;