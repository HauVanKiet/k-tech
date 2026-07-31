const mongoose = require('mongoose');

const ProductReviewSchema = new mongoose.Schema({
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    user_name: { type: String, required: true },
    type: { type: String, enum: ['review', 'discussion'], default: 'review' },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    content: { type: String, required: true },
    verified_buyer: { type: Boolean, default: false } // Người đã mua hàng
}, { timestamps: true });

module.exports = mongoose.model('ProductReview', ProductReviewSchema);