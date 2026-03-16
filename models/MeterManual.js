import mongoose from 'mongoose';

const MeterManualSchema = new mongoose.Schema({
  manufacturer: { type: String, required: true, index: true },
  types: { type: String, required: true, index: true },
  item: { type: String, required: true, index: true },
  idNote: { type: String, default: '' },
  accuracyClass: { type: String, default: '' },
  errorClass: { type: String, default: '' },
  terminalPoint: { type: String, default: '' },
  baseInfo: [{ type: String }],
  standards: [{ type: String }],
  workOrders: [{ type: String }],
  manufacturerYears: [{ type: String }],
  serialRanges: [{
    start: { type: Number, required: true },
    end: { type: Number, required: true }
  }],
  warrantyPeriod: { type: String, default: '' },
  meterPrice: [{
    mf: { type: String, default: '' },
    price: { type: Number, default: 0 }
  }],
  rateInfo: [{ type: String }],
  demandInfo: [{ type: String }],
  kvarInfo: [{ type: String }],
  prepaidInfo: [{ type: String }],
  networkInfo: [{ type: String }],
  netMeterInfo: [{ type: String }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  createdBy: {
    username: String,
    fullName: String,
    pbsName: String,
    profilePic: String,
    apiKey: String
  },
  contributors: [{
    username: String,
    fullName: String,
    pbsName: String,
    profilePic: String,
    contribution: String,
    date: { type: Date, default: Date.now }
  }],
  images: [{
    url: String,
    approved: { type: Boolean, default: false },
    uploadedBy: {
      username: String,
      fullName: String
    },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Text index for search
MeterManualSchema.index({ manufacturer: 'text', types: 'text', item: 'text', idNote: 'text' });

export default mongoose.models.MeterManual || mongoose.model('MeterManual', MeterManualSchema);
