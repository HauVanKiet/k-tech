const express = require('express');
const router = express.Router();
const BuyBack = require('../models/Buyback');
const jwt = require('jsonwebtoken');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'K_Tech_Buyback',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});
const upload = multer({ storage: storage });

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Bắt buộc phải đăng nhập" });
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) { res.status(400).json({ message: "Token không hợp lệ" }); }
};

// 1. USER gửi yêu cầu thu cũ (có upload ảnh qua Cloudinary)
router.post('/request', authMiddleware, upload.fields([
    { name: 'invoiceImages', maxCount: 5 },
    { name: 'deviceImages', maxCount: 8 }
]), async (req, res) => {
    try {
        const { fullName, phone, address, deviceInfo, deviceType, exteriorCondition, deviceCondition, desiredPrice } = req.body;
        
        const invoiceUrls = req.files?.invoiceImages ? req.files.invoiceImages.map(f => f.path) : [];
        const deviceUrls = req.files?.deviceImages ? req.files.deviceImages.map(f => f.path) : [];

        const newRequest = new BuyBack({
            user_id: req.user.id,
            fullName, phone, address, deviceInfo, deviceType,
            exteriorCondition, deviceCondition, desiredPrice: Number(desiredPrice) || 0,
            invoiceImages: invoiceUrls,
            deviceImages: deviceUrls
        });
        await newRequest.save();
        res.status(201).json({ message: "Gửi yêu cầu thu cũ thành công!", data: newRequest });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. USER xem yêu cầu của mình
router.get('/my-requests', authMiddleware, async (req, res) => {
    try {
        const requests = await BuyBack.find({ user_id: req.user.id }).sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. ADMIN xem tất cả
router.get('/admin/all', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Từ chối quyền truy cập" });
    try {
        const requests = await BuyBack.find().populate('user_id', 'username email').sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. ADMIN định giá
router.put('/admin/price/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Từ chối" });
    try {
        const { adminPrice, adminNote } = req.body;
        const updated = await BuyBack.findByIdAndUpdate(req.params.id, { adminPrice, adminNote, status: 'priced' }, { new: true });
        res.json({ message: "Đã gửi định giá", data: updated });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 5. USER phản hồi (chấp nhận/từ chối giá)
router.put('/user/respond/:id', authMiddleware, async (req, res) => {
    try {
        const { action } = req.body;
        const update = { status: action === 'accept' ? 'accepted' : 'rejected' };
        if (action !== 'accept') update.shippingStatus = 'cancelled';
        const updated = await BuyBack.findByIdAndUpdate(req.params.id, update, { new: true });
        res.json({ message: action === 'accept' ? 'Đã chấp nhận giá' : 'Đã từ chối', data: updated });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 6. USER chọn phương thức giao hàng
router.put('/user/shipping/:id', authMiddleware, async (req, res) => {
    try {
        const { shippingMethod, deliveryName, deliveryPhone, deliveryAddress } = req.body;
        const statusMap = { store: 'waiting_receive', shipping: 'waiting_delivery', home: 'waiting_receive' };
        const updated = await BuyBack.findByIdAndUpdate(req.params.id, {
            shippingMethod, deliveryName, deliveryPhone, deliveryAddress,
            shippingStatus: statusMap[shippingMethod] || '',
        }, { new: true });
        res.json({ message: "Đã cập nhật phương thức giao hàng", data: updated });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 7. ADMIN cập nhật trạng thái
router.put('/admin/status/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Từ chối" });
    try {
        const { status, shippingStatus } = req.body;
        const update = {};
        if (status) update.status = status;
        if (shippingStatus) update.shippingStatus = shippingStatus;
        const updated = await BuyBack.findByIdAndUpdate(req.params.id, update, { new: true });
        res.json({ message: "Đã cập nhật trạng thái", data: updated });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 8. Chat: gửi tin nhắn
router.post('/chat/:id', authMiddleware, async (req, res) => {
    try {
        const { text } = req.body;
        const sender = req.user.role === 'admin' ? 'admin' : 'user';
        const request = await BuyBack.findById(req.params.id);
        if (!request) return res.status(404).json({ message: "Không tìm thấy" });
        request.messages.push({ sender, text, createdAt: new Date() });
        await request.save();
        res.json({ message: "Đã gửi tin nhắn", data: request.messages });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 9. Chat: lấy tin nhắn
router.get('/chat/:id', authMiddleware, async (req, res) => {
    try {
        const request = await BuyBack.findById(req.params.id);
        if (!request) return res.status(404).json({ message: "Không tìm thấy" });
        res.json(request.messages);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;