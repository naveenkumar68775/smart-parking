
const buildInvoiceHtml = ({ invoiceNumber, user, booking, payment }) => {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb;">
    <h2>Smart Parking - Invoice</h2>
    <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
    <p><strong>Date:</strong> ${new Date(payment.paymentDate).toLocaleString()}</p>
    <hr />
    <p><strong>Billed To:</strong> ${user.name} (${user.email})</p>
    <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
    <p><strong>Slot:</strong> ${booking.slot?.slotNumber || ''}</p>
    <p><strong>Amount:</strong> ₹${payment.amount}</p>
    <p><strong>Payment Method:</strong> ${payment.paymentMethod}</p>
    <p><strong>Transaction ID:</strong> ${payment.transactionId}</p>
    <hr />
    <p>Thank you for using Smart Parking!</p>
  </div>`;
};

module.exports = { buildInvoiceHtml };
