const Invoice = require('../models/Invoice');
async function nextInvoiceNumber(){
  const year = new Date().getFullYear();
  const last = await Invoice.findOne({invoiceNumber:new RegExp(`^INV-${year}-`)}).sort({createdAt:-1}).select('invoiceNumber').lean();
  const n = last ? Number(last.invoiceNumber.split('-').pop()) + 1 : 1;
  return `INV-${year}-${String(n).padStart(4,'0')}`;
}
function calculateTotals(items, discount=0, discountType='PERCENTAGE'){
  const normalized = items.map(i=>{
    const quantity=Number(i.quantity), unitPrice=Number(i.unitPrice), taxRate=Number(i.taxRate||0), itemDiscount=Number(i.discount||0);
    const gross=quantity*unitPrice; const afterItemDiscount=Math.max(0,gross-itemDiscount); const tax=afterItemDiscount*taxRate/100;
    return {...i,quantity,unitPrice,taxRate,discount:itemDiscount,amount:afterItemDiscount,taxAmount:tax};
  });
  const subtotal=normalized.reduce((s,i)=>s+i.quantity*i.unitPrice,0);
  const discountAmount=discountType==='FIXED' ? Math.min(Number(discount||0),subtotal) : subtotal*Number(discount||0)/100;
  const taxableAmount=Math.max(0,subtotal-discountAmount);
  const weightedTaxBase=normalized.reduce((s,i)=>s+i.amount,0);
  const taxRateBase=weightedTaxBase ? normalized.reduce((s,i)=>s+i.amount*i.taxRate,0)/weightedTaxBase : 0;
  const taxAmount=taxableAmount*taxRateBase/100;
  const totalAmount=taxableAmount+taxAmount;
  return {items:normalized,subtotal,discount:Number(discount||0),discountAmount,taxRate:taxRateBase,taxAmount,totalAmount};
}
module.exports={nextInvoiceNumber,calculateTotals};
