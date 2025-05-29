import mongoose from "mongoose";
const Schema = mongoose.Schema({
  senderid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  receiverid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  message: {
    type: String,
    required: function() {
      return this.messageType === 'text' || !this.messageType;
    }
  },
  voiceMessage: {
    type: String, 
    required: function() {
      return this.messageType === 'voice';
    }
  },
  fileUrl: {
    type: String,
    required: function() {
      return (this.messageType === 'file' || this.messageType === 'image' || this.messageType === 'video') && !this.storedLocally;
    }
  },
  fileName: {
    type: String,
    required: function() {
      return this.messageType === 'file' || this.messageType === 'image' || this.messageType === 'video';
    }
  },
  fileSize: {
    type: Number,
    required: function() {
      return this.messageType === 'file' || this.messageType === 'image' || this.messageType === 'video';
    }
  },
  fileType: {
    type: String,
    required: function() {
      return this.messageType === 'file' || this.messageType === 'image' || this.messageType === 'video';
    }
  },
  // Fields for locally stored files
  fileId: {
    type: String,
    required: function() {
      return (this.messageType === 'file' || this.messageType === 'image' || this.messageType === 'video') && this.storedLocally;
    }
  },
  storedLocally: {
    type: Boolean,
    default: false
  },
  read: {
    type: Boolean,
    default: false
  },
  messageType: {
    type: String,
    enum: ['text', 'voice', 'file', 'image', 'video'],
    default: 'text'
  },
  time: {
    type: Date,
    default: Date.now
  }
});

const Conversation = mongoose.model('Message', Schema);
export default Conversation;
