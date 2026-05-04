const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., General, VIP
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  sold: { type: Number, default: 0 },
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String },
  price: { type: Number, default: 0 },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tickets: [ticketSchema],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' }, // Admin approval
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
