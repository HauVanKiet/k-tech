const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, default: 'Tin tức' },
    excerpt: { type: String, default: '' },
    content: { type: String, required: true },
    coverImage: { type: String, default: '' },
    author: { type: String, default: 'K_Tech' },
    status: { type: String, enum: ['published', 'draft'], default: 'published' }
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);