const Payment=require('../models/Payment'); const {notifyUser,notifyRoles}=require('./notificationService');
async function paymentSummary(invoiceId){const payments=await Payment.find({invoice:invoiceId,status:'SUCCESS'}).lean(); const paid=payments.reduce((s,p)=>s+p.amount,0); return {payments,paid};}
async function computeInvoiceStatus(invoice){const {paid}=await paymentSummary(invoice._id); const total=invoice.totalAmount; let status=invoice.status;
 if(status==='CANCELLED'||status==='DRAFT') return {status,paid,remaining:Math.max(0,total-paid)};
 if(paid>=total-0.005) status='PAID'; else if(paid>0) status='PARTIALLY_PAID'; else if(new Date(invoice.dueDate)<new Date()) status='OVERDUE'; else status=invoice.status==='SENT'?'SENT':'PENDING';
 if(status!=='DRAFT'&&status!=='CANCELLED') invoice.status=status; return {status,paid,remaining:Math.max(0,total-paid)};
}
async function refreshStatuses(){const Invoice=require('../models/Invoice'); const invoices=await Invoice.find({status:{$nin:['PAID','CANCELLED','DRAFT']}}).populate('client'); for(const inv of invoices){const previous=inv.status; const s=await computeInvoiceStatus(inv); if(previous!==s.status){inv.status=s.status; await inv.save(); if(s.status==='OVERDUE'){await notifyRoles(['ADMIN','STAFF'],'Invoice overdue',`${inv.invoiceNumber} is now overdue.`,'WARNING',inv._id); if(inv.client?.user) await notifyUser(inv.client.user,'Invoice overdue',`${inv.invoiceNumber} is now overdue.`,'WARNING',inv._id);}}}}
module.exports={paymentSummary,computeInvoiceStatus,refreshStatuses};
