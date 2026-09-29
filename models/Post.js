const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    content: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: '' }, // Cloudinary URL only, never binary/Base64
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
