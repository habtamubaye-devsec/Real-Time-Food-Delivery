const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issue: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  adminReply: { type: String, trim: true },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

supportTicketSchema.index({ orderId: 1 });
supportTicketSchema.index({ customerId: 1 });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
// This schema defines a support ticket system for handling customer issues related to orders.