import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true,
  },
  section: {
    type: String,
    required: true
  },
  manuscriptTitle: {
    type: String,
    required: true,
  },
  adviser: {
    type: String,
    required: true,
  },
  panelMembers: {
    type: [String],
    required: true,
  },
  defenseDate: {
    type: Date,
    required: true,
  },
  room: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
    adviserStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  panelStatus: [
    {
      name: String, // panel member's name
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      }
    }
  ],
}, { timestamps: true });

// Compound unique index: studentName + defenseDate must be unique
scheduleSchema.index({ studentName: 1, defenseDate: 1 }, { unique: true });

export default mongoose.models.Schedule || mongoose.model('Schedule', scheduleSchema);
