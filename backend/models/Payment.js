const mongoose = require('mongoose');

/**
 * Manual bKash / Nagad "Send Money" verification flow.
 *
 *   status flow:
 *     requested  -> seller asks buyer for BDT X (creates payment + message card)
 *     submitted  -> buyer sends money via bKash/Nagad app, then submits Transaction ID
 *     paid       -> seller confirms they received it
 *     disputed   -> buyer/seller flags a problem
 *     cancelled  -> either party cancels before payment
 */
const PaymentSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },

    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    amount: { type: Number, required: true, min: 1 }, // BDT
    method: { type: String, enum: ['bkash', 'nagad'], required: true },
    receiverNumber: { type: String, required: true }, // shown to buyer
    note: { type: String, default: '' },

    status: {
      type: String,
      enum: ['requested', 'submitted', 'paid', 'disputed', 'cancelled'],
      default: 'requested',
      index: true,
    },

    // Filled by buyer when they submit
    transactionId: { type: String, default: '' },
    submittedAt: { type: Date, default: null },

    // Filled by seller when they confirm receipt
    confirmedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', PaymentSchema);
