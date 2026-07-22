const mongoose = require('mongoose');

const BuyBackSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    device_name: { type: String, required: true },
    specs: { type: String, required: true },
    description: { type: String },
    images: [{ type: String }], // Lưu đường dẫn ảnh
    admin_price: { type: Number, default: null }, // Giá admin định
    status: { 
        type: String, 
        enum: ['pending', 'priced', 'accepted', 'rejected'], 
        default: 'pending' 
    },
    shipping_method: { type: String, enum: ['pickup', 'shipping', null], default: null },
    payment_status: { type: String, enum: ['pending', 'paid'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('BuyBack', BuyBackSchema);