import { Server } from "socket.io";
import express from "express";
import http from "http"

const app = express();
const server = http.createServer(app);  

const users = {}
const io = new Server(server, {
    cors: {
      origin: "https://chatapp-frontend-lemon.vercel.app", 
      methods: ["GET", "POST"],        
      credentials: true               
    }
  });
  

export const getreciversocketid = (receiverid)=>{
  console.log("reciverid",receiverid);
   return users[receiverid];  //  yha glti hogi thi ki users[receiverid] kiya tha
}


io.on('connection', (socket)=>{
    console.log('User connected',socket.id);

    const userid = socket.handshake.query.userId
    if(userid){
        users[userid] = socket.id   
        console.log('User assigned', users);
    }

    io.emit('getonlineusers',Object.keys(users))


  socket.on('disconnect', ()=>{
          console.log('User disconnected',socket.id);
          delete users[userid]
          io.emit('getonlineusers',Object.keys(users))
  })
})

export {server,io,app} 
