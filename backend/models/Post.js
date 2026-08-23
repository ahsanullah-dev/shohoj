const mongoose = require('mongoose');

const SEGMENTS = [
  'tuition',          // Tuition Offers
  'tech',             // Tech & Repair Services
  'creative',         // Creative & Design Services
  'errands',          // Campus Errands & Micro-jobs
  'marketplace',      // Buy, Sell & Exchange
];

const ImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: '' },
  },
  { _id: false }
);

const PostSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    segment: { type: String, enum: SEGMENTS, required: true, index: true },
    category: { type: String, default: '', index: true },

    // Post type differs per segment:
    //   tuition:     'offer' | 'wanted'
    //   tech/creative/errands: 'offer' | 'wanted'
    //   marketplace: 'sell'  | 'buy' | 'exchange'
    postType: { type: String, default: 'offer', index: true },

    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },

    // Flexible per-segment fields
    price: { type: Number, default: null },      // BDT
    priceNote: { type: String, default: '' },    // e.g. "per hour", "negotiable"
    condition: { type: String, default: '' },    // marketplace: new/like new/used/for parts
    location: { type: String, default: '' },     // hall / area
    urgency: { type: String, default: '' },      // errands: low/normal/urgent
    deliveryTime: { type: String, default: '' }, // creative: e.g. "3 days"
    courseCode: { type: String, default: '' },   // tuition: e.g. EEE 3201
    mode: { type: String, default: '' },         // tuition: online/in-person/either

    images: { type: [ImageSchema], default: [] },

    // Listing status lifecycle: available → reserved → sold
    status: {
      type: String,
      enum: ['available', 'reserved', 'sold'],
      default: 'available',
      index: true,
    },
    // Free-text price note ("per hour", "negotiable"…) + explicit negotiable flag
    negotiable: { type: Boolean, default: false },
    tags: { type: [String], default: [] },

    // View counter (incremented on each post detail open)
    views: { type: Number, default: 0 },

    isRuetOnly: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

PostSchema.index({ title: 'text', description: 'text', category: 'text', courseCode: 'text' });

module.exports = mongoose.model('Post', PostSchema);
module.exports.SEGMENTS = SEGMENTS;
