
import mongoose, { model } from "mongoose";

const Schema = mongoose.Schema({
    members:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    messages:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Message",
            default:[]
        }
    ]    
})
const Message = new model('COnversation',Schema);
export default Message;