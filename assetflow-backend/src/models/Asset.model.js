const mongoose = require('mongoose');
const { ASSET_STATUS } = require('../config/constants');

const assetSchema = new mongoose.Schema(
  {
    // Auto-generated tag like AF-0001 (or provided manually)
    assetTag: { type: String, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },

    // Lifecycle status — full set per spec
    status: {
      type: String,
      enum: Object.values(ASSET_STATUS),
      default: ASSET_STATUS.AVAILABLE,
    },

    // Physical state — used in audit verification and return condition check-in
    condition: {
      type: String,
      enum: ['new', 'good', 'fair', 'poor'],
      default: 'good',
    },

    // Financial / registration info
    serialNumber: { type: String, default: '', trim: true },
    purchaseDate: { type: Date },       // internal field
    acquisitionDate: { type: Date },    // spec field (same intent as purchaseDate, kept separate for clarity)
    purchaseValue: { type: Number, default: 0 },
    acquisitionCost: { type: Number, default: 0 }, // spec label
    currentValue: { type: Number, default: 0 },
    vendor: { type: String, default: '' },
    warrantyExpiry: { type: Date },

    // Location & identification
    location: { type: String, default: '', trim: true },
    qrCode: { type: String, default: '' },

    // Media
    images: [{ type: String }],
    documents: [{ type: String }],

    // Booking
    isBookable: { type: Boolean, default: false },

    // Retirement / disposal tracking
    retiredAt: { type: Date },
    disposedAt: { type: Date },
  },
  { timestamps: true }
);

// Full-text search: name, assetTag, serialNumber, location
assetSchema.index({ name: 'text', assetTag: 'text', serialNumber: 'text', location: 'text' });

module.exports = mongoose.model('Asset', assetSchema);
