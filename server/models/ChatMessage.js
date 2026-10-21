const mongoose=require('mongoose');
const schema=new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},role:{type:String,enum:['ADMIN','STAFF','CLIENT'],required:true},message:{type:String,required:true,maxlength:4000},sender:{type:String,enum:['USER','BOT'],required:true}},{timestamps:true}); module.exports=mongoose.model('ChatMessage',schema);
