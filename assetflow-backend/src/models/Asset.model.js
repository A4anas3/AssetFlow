const mongoose = require('mongoose');
const { ASSET_STATUS } = require('../config/constants');

const assetSchema = new mongoose.Schema(
  {
    assetTag: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
    status: { type: String, enum: Object.values(ASSET_STATUS), default: ASSET_STATUS.AVAILABLE },
    purchaseDate: { type: Date },
    purchaseValue: { type: Number, default: 0 },
    currentValue: { type: Number, default: 0 },
    vendor: { type: String, default: '' },
    serialNumber: { type: String, default: '' },
    warrantyExpiry: { type: Date },
    location: { type: String, default: '' },
    images: [{ type: String }],
    qrCode: { type: String, default: '' },
    isBookable: { type: Boolean, default: false },
  },
  { timestamps: true }
);

assetSchema.index({ name: 'text', assetTag: 'text', serialNumber: 'text' });

module.exports = mongoose.model('Asset', assetSchema);
