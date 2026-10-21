const mongoose=require('mongoose'); const bcrypt=require('bcryptjs');
const schema=new mongoose.Schema({name:{type:String,required:true,trim:true},email:{type:String,required:true,unique:true,lowercase:true,trim:true},phone:String,password:{type:String,required:true,select:false},role:{type:String,enum:['ADMIN','STAFF','CLIENT'],default:'CLIENT'},avatar:String,status:{type:String,enum:['ACTIVE','INACTIVE'],default:'ACTIVE'}},{timestamps:true});
schema.pre('save',async function(next){if(!this.isModified('password')) return next(); this.password=await bcrypt.hash(this.password,12); next();});
schema.methods.comparePassword=function(p){return bcrypt.compare(p,this.password);};
module.exports=mongoose.model('User',schema);
