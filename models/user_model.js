import { timeStamp } from "console";
import mongoose from "mongoose";
const Schema  = mongoose.Schema({
    
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        required:true,
        enum:['admin','user']
    },
    timeStamp:{
        type:Date,
        default: Date.now
    }
    

})
const User = mongoose.model('User',Schema);
export default User;