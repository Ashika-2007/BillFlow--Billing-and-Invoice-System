const Notification=require('../models/Notification'); const User=require('../models/User');
async function notifyUser(user,title,message,type='INFO',relatedInvoice=null){return Notification.create({user,title,message,type,relatedInvoice});}
async function notifyRoles(roles,title,message,type='INFO',relatedInvoice=null){const users=await User.find({role:{$in:roles},status:'ACTIVE'}).select('_id'); if(users.length) await Notification.insertMany(users.map(u=>({user:u._id,title,message,type,relatedInvoice})));}
module.exports={notifyUser,notifyRoles};
