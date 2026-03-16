import mongoose from 'mongoose';

const DisplayManualSchema = new mongoose.Schema({
  meterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MeterManual',
    required: true,
    index: true
  },
  title: { type: String, required: true },
  rows: [{
    slNo: { type: Number },
    idNumber: { type: String, default: '' },
    display: { type: String, default: '' },
    unit: { type: String, default: '' },
    parameterName: { type: String, default: '' },
    parameterDetails: { type: String, default: '' },
    remarks: { type: String, default: '' }
  }],
  likes: [{ type: String }], // array of usernames
  likeCount: { type: Number, default: 0 },
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
  }
}, {
  timestamps: true
});

export default mongoose.models.DisplayManual || mongoose.model('DisplayManual', DisplayManualSchema);
