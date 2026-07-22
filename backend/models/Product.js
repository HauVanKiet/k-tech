const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    coverImage: { type: String, required: true },  // Lưu riêng link ảnh bìa (Ảnh đầu tiên)
    images: [{ type: String }],                    // Mảng lưu tất cả các ảnh (Tối đa 8 ảnh)
    description: { type: String },
    category: { type: String, default: 'Laptop' },
    condition: { type: String, enum: ['mới', 'cũ'], default: 'mới' },
    quantity: { type: Number, default: 0, min: 0 },
    stockStatus: { type: String, enum: ['còn hàng', 'tạm hết hàng'], default: 'còn hàng' },
    warranty: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);  