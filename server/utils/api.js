const sendSuccess = (res, data = {}, message = 'Success', status = 200) => res.status(status).json({success:true,message,data});
const sendError = (res, message = 'Something went wrong', status = 500, details) => res.status(status).json({success:false,message,...(details ? {details} : {})});
module.exports = {sendSuccess, sendError};
