const mongoose=require('mongoose');
const schema=new mongoose.Schema({name:{type:String,required:true,trim:true},email:{type:String,required:true,lowercase:true,trim:true},phone:String,companyName:String,address:String,city:String,state:String,country:{type:String,default:'India'},postalCode:String,taxId:String,notes:String,status:{type:String,enum:['ACTIVE','INACTIVE'],default:'ACTIVE'},user:{type:mongoose.Schema.Types.ObjectId,ref:'User',default:null}},{timestamps:true});
schema.index({name:'text',email:'text',companyName:'text'}); module.exports=mongoose.model('Client',schema);
