import mongoose from 'mongoose'

const companySchema = new mongoose.Schema({
  // OAuth Info
  email: { type: String, required: true, unique: true },
  googleId: { type: String },
  accessToken: { type: String },

  // Company Details
  companyName: { type: String },
  companyWebsite: { type: String },
  contactName: { type: String },
  businessEmail: { type: String },
  logoUrl: { type: String },
  
  // Optional Documents
  gstCertificate: {
    uploaded: { type: Boolean, default: false },
    url: { type: String }
  },
  cinDocument: {
    uploaded: { type: Boolean, default: false },
    url: { type: String }
  },

  // Metadata
  isOnboarded: { type: Boolean, default: false },
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Update the updatedAt timestamp before saving
companySchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.Company || mongoose.model('Company', companySchema)
