const mongoose = require('mongoose');

const BuyBackSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Thông tin người dùng nhập
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    // Thông tin thiết bị
    deviceInfo: { type: String, required: true },
    deviceType: { type: String, required: true },
    exteriorCondition: { type: String, required: true },
    deviceCondition: { type: String, required: true },
    invoiceImage: [{ type: String }],
    deviceImages: [{ type: String }],
    desiredPrice: { type: Number, default: 0 },
    // Admin định giá
    adminPrice: { type: Number, default: null },
    adminNote: { type: String, default: '' },
    adminImages: [{ type: String }],
    status: { 
        type: String, 
        enum: ['pending', 'priced', 'accepted', 'rejected', 'completed', 'cancelled'], 
        default: 'pending' 
    },
    // Phương thức gửi hàng
    shippingMethod: { type: String, enum: ['store', 'shipping', 'home', null], default: null },
    // Thông tin giao hàng sau khi accept
    deliveryName: { type: String, default: '' },
    deliveryPhone: { type: String, default: '' },
    deliveryAddress: { type: String, default: '' },
    packagingImages: [{ type: String }],
    // Trạng thái chi tiết
    shippingStatus: { 
        type: String, 
        enum: ['', 'waiting_delivery', 'waiting_receive', 'received', 'completed', 'cancelled'], 
        default: '' 
    },
    // Chat
    messages: [{
        sender: { type: String, enum: ['user', 'admin'] },
        text: { type: String },
        images: [{ type: String }],
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('BuyBack', BuyBackSchema);