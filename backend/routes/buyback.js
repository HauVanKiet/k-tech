const express = require('express');
const router = express.Router();
const BuyBack = require('../models/BuyBack');
const jwt = require('jsonwebtoken');

// Middleware kiểm tra đăng nhập (Bắt buộc tài khoản)
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Bắt buộc phải đăng nhập" });
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) { res.status(400).json({ message: "Token không hợp lệ" }); }
};

// 1. USER gửi yêu cầu thu máy
router.post('/request', authMiddleware, async (req, res) => {
    try {
        const { device_name, specs, description, images } = req.body;
        const newRequest = new BuyBack({
            user_id: req.user.id,
            device_name, specs, description, images
        });
        await newRequest.save();
        res.status(201).json({ message: "Gửi thông tin máy thành công, chờ admin định giá!", data: newRequest });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. ADMIN xem tất cả yêu cầu thu máy
router.get('/admin/requests', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Quyền truy cập bị từ chối" });
    try {
        const requests = await BuyBack.find().populate('user_id', 'username email');
        res.json(requests);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. ADMIN định giá và phản hồi
router.put('/admin/price/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Quyền truy cập bị từ chối" });
    try {
        const { admin_price } = req.body;
        const updated = await BuyBack.findByIdAndUpdate(req.params.id, { admin_price, status: 'priced' }, { new: true });
        res.json({ message: "Đã gửi định giá cho khách", data: updated });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. USER chấp nhận hoặc từ chối và chọn cách ship
router.put('/user/respond/:id', authMiddleware, async (req, res) => {
    try {
        const { action, shipping_method } = req.body; // action: 'accept' hoặc 'reject'
        let status = action === 'accept' ? 'accepted' : 'rejected';
        
        const updated = await BuyBack.findByIdAndUpdate(
            req.params.id, 
            { status, shipping_method: action === 'accept' ? shipping_method : null }, 
            { new: true }
        );
        res.json({ message: "Phản hồi thành công", data: updated });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;