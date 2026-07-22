const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },       // Họ và tên
    username: { type: String, required: true, unique: true }, // Tên đăng nhập
    phone: { type: String, required: true },          // Số điện thoại
    birthDate: { type: String, required: true },      // Ngày tháng năm sinh
    email: { type: String, required: true, unique: true }, // Email
    password: { type: String, required: true },       // Mật khẩu
    role: { type: String, enum: ['user', 'admin'], default: 'user' } // Vai trò
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);