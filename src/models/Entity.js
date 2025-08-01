/**
 * Entity Model
 * @description Core entity schema for GEP platform
 */

const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  country: { type: String, required: true },
  postalCode: String
}, { _id: false });

const entitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  legalName: {
    type: String,
    required: true,
    trim: true
  },
  entityType: {
    type: String,
    enum: ['corporation', 'llc', 'partnership', 'sole_proprietorship', 'trust', 'other'],
    required: true
  },
  jurisdiction: {
    type: String,
    required: true
  },
  registrationNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  taxId: {
    type: String,
    sparse: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'dissolved'],
    default: 'pending'
  },
  incorporationDate: {
    type: Date
  },
  fiscalYearEnd: {
    month: { type: Number, min: 1, max: 12 },
    day: { type: Number, min: 1, max: 31 }
  },
  registeredAddress: addressSchema,
  businessAddress: addressSchema,
  parentEntity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entity'
  },
  owners: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entity'
  }],
  directors: [{
    name: String,
    position: String,
    appointmentDate: Date,
    isActive: { type: Boolean, default: true }
  }],
  compliance: {
    lastAuditDate: Date,
    nextAuditDue: Date,
    filingStatus: {
      type: String,
      enum: ['current', 'overdue', 'pending'],
      default: 'current'
    }
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for common queries
entitySchema.index({ jurisdiction: 1, status: 1 });
entitySchema.index({ parentEntity: 1 });
entitySchema.index({ 'compliance.filingStatus': 1 });

module.exports = mongoose.model('Entity', entitySchema);
