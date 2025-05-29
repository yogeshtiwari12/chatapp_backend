import mongoose from "mongoose";
import Message from "../models/message.js";
import COnversation from "../models/conversation.js";
import { getreciversocketid, io } from "../server.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

export const sendmesage = async (req, res) => {    
    const { message, voiceMessage, messageType, fileId, fileName, fileSize, fileType, storedLocally, fileUrl } = req.body;
    const receiverid = req.params.id;
    const senderid = req.user.id;
    
    try {
        let connection = await COnversation.findOne({
            members: { $all: [senderid, receiverid] }
        });

        if (!connection) {
            connection = new COnversation({ members: [senderid, receiverid] });
        }
        
        const messageData = {
            senderid,
            receiverid,
            messageType: messageType || 'text',
            read: false,
            time: new Date()
        };

        if (messageType === 'text' || !messageType) {
            messageData.message = message;
        } else if (messageType === 'voice') {
            messageData.voiceMessage = voiceMessage;
        } else if ((messageType === 'file' || messageType === 'image' || messageType === 'video')) {
            // Handle Appwrite uploads - files are already uploaded to Appwrite
            if (fileUrl) {
                messageData.fileUrl = fileUrl;
                messageData.fileName = fileName;
                messageData.fileSize = fileSize;
                messageData.fileType = fileType;
                
                if (fileId) {
                    messageData.fileId = fileId;
                    messageData.storedLocally = storedLocally === 'true';
                }
            } 
            // Handle regular file uploads through multer
            else if (req.file) {
                const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
                messageData.fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
                messageData.fileName = req.file.originalname;
                messageData.fileSize = req.file.size;
                messageData.fileType = req.file.mimetype;
            }
        }
        
        const newmessage = new Message(messageData);

        if (newmessage) {
            connection.messages.push(newmessage._id);
        }

        await Promise.all([
            connection.save(),
            newmessage.save(),
        ]);

        const receiversocketid = getreciversocketid(receiverid);
        console.log("receiversocketid", receiversocketid);

        if (receiversocketid) {
            io.to(receiversocketid).emit("newMessage", newmessage);
        }

        res.status(200).json({ message: "Message sent", newmessage });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error.message);
    }
}

export const getmessage = async (req, res) => {
    const receiverid = req.params.id;
    const senderid = req.user.id;
    
    try {
        const connection = await COnversation.findOne({
            members: { $all: [senderid, receiverid] }
        }).populate("messages");

        if (!connection) {
            return res.status(200).json([]); 
        }
        
        const messages = connection.messages;
        return res.status(200).json(messages);
    }
    catch (error) {
        res.status(500).json({ message: "something went wrong", error: error.message });
    }
}


export const markMessagesAsRead = async (req, res) => {
    try {
        const senderId = req.params.senderId; // jo message bhej rha hai
        const receiverId = req.user.id; 

        // Find all unread messages from sender to current user and mark them as read
        const result = await Message.updateMany(
            { 
                senderid: senderId,
                receiverid: receiverId,
                read: false
            },
            { read: true }
        );


        const senderSocketId = getreciversocketid(senderId);
        if (senderSocketId) {
            io.to(senderSocketId).emit("messagesRead", { 
                by: receiverId,
                timestamp: new Date()
            });
        }

        res.status(200).json({ 
            message: "Messages marked as read",
            updatedCount: result.modifiedCount
        });
    } catch (error) {
        console.error("Error marking messages as read:", error);
        res.status(500).json({ message: "Failed to mark messages as read" });
    }
};

export const getUnreadCounts = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Find all messages where current user is the recipient and messages are unread
        const unreadMessages = await Message.find({
            receiverid: userId, // jo current user hoga uske messages as a recier id bhej rahe hain
            read: false
        });
        
    
        const counts = {};
        unreadMessages.forEach(msg => {
            const senderId = msg.senderid.toString();
            if (!counts[senderId]) {
                counts[senderId] = 0;
            }
            counts[senderId]++;
        });
        
        res.status(200).json({ counts });
    } catch (error) {
        console.error("Error getting unread counts:", error);
        res.status(500).json({ message: "Failed to get unread counts" });
    }
};