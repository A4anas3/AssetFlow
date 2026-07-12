const mongoose = require('mongoose');

// Category-specific fields — e.g. warrantyPeriod for Electronics, fuelType for Vehicles
const customFieldSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },   // e.g. "Warranty Period"
    value: { type: String, required: true, trim: true }, // e.g. "24 months"
  },
  { _id: false }
);

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    depreciationRate: { type: Number, default: 0, min: 0, max: 100 },

    // Spec: "Optional category-specific fields (e.g. warranty period for Electronics)"
    customFields: { type: [customFieldSchema], default: [] },

    // Convenience field: default warranty period in months for this category
    defaultWarrantyMonths: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
