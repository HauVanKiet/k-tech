const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const normalizeEmail = (value = '') => value.trim().toLowerCase();
const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// API Đăng ký tài khoản khách hàng
router.post('/register', async (req, res) => {
    try {
        const { fullName, username, phone, birthDate, email, password } = req.body;
        const normalizedEmail = normalizeEmail(email);
        const normalizedUsername = (username || '').trim();

        // 1. Kiểm tra xem các trường bắt buộc có bị bỏ trống không
        if (!fullName || !normalizedUsername || !phone || !birthDate || !normalizedEmail || !password) {
            return res.status(400).json({ message: "Vui lòng điền đầy đủ tất cả các ô thông tin!" });
        }
        
        // 2. Kiểm tra trùng lặp tài khoản
        const userExist = await User.findOne({ $or: [{ email: { $regex: new RegExp(`^${escapeRegex(normalizedEmail)}$`, 'i') } }, { username: normalizedUsername }] });
        if (userExist) {
            return res.status(400).json({ message: "Tên đăng nhập hoặc Email này đã được sử dụng!" });
        }

        // 3. Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 4. Lưu vào Database
        const newUser = new User({ 
            fullName, 
            username: normalizedUsername, 
            phone, 
            birthDate, 
            email: normalizedEmail, 
            password: hashedPassword, 
            role: 'user' 
        });
        
        await newUser.save();
        res.status(201).json({ message: "Đăng ký tài khoản khách hàng thành công!" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server: " + err.message });
    }
});

// API Đăng nhập
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = normalizeEmail(email);
        const user = await User.findOne({ email: { $regex: new RegExp(`^${escapeRegex(normalizedEmail)}$`, 'i') } });
        if (!user) return res.status(400).json({ message: "Tài khoản hoặc Email không tồn tại!" });

        if (user.email !== normalizedEmail) {
            user.email = normalizedEmail;
            await user.save();
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Mật khẩu không chính xác!" });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { _id: user._id, id: user._id, fullName: user.fullName, username: user.username, phone: user.phone, birthDate: user.birthDate, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// ROUTE: Lấy toàn bộ danh sách tài khoản (Chỉ Admin mới có quyền lấy)
router.get('/users', async (req, res) => {
    try {
        // Lấy tất cả user nhưng bỏ qua trường password để bảo mật
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Lỗi hệ thống khi lấy danh sách user: " + err.message });
    }
});

// ROUTE: Xóa một tài khoản bất kỳ bằng ID
router.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "Đã xóa tài khoản thành công!" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi khi xóa tài khoản: " + err.message });
    }
});

module.exports = router;