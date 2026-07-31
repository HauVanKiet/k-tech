const express = require('express');
const router = express.Router();
const ProductReview = require('../models/ProductReview');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Bắt buộc phải đăng nhập" });
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        console.error("JWT Verify Error:", err.message);
        res.status(400).json({ message: "Token không hợp lệ: " + err.message }); 
    }
};

// Lấy toàn bộ đánh giá + thảo luận của 1 sản phẩm (public)
router.get('/product/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await ProductReview.find({ product_id: productId })
            .sort({ createdAt: -1 })
            .limit(100);
        res.json({ success: true, reviews });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Thêm đánh giá / thảo luận (cần đăng nhập)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { product_id, type, rating, content } = req.body;
        const product = await Product.findById(product_id);
        if (!product) return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
        if (!content || !content.trim()) return res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung' });

        // Chỉ cho phép 1 đánh giá/sản phẩm/user
        if (type === 'review') {
            const existing = await ProductReview.findOne({ product_id, user_id: req.user.id, type: 'review' });
            if (existing) {
                return res.status(400).json({ success: false, message: 'Bạn đã đánh giá sản phẩm này rồi!' });
            }
        }

        const newReview = new ProductReview({
            product_id,
            user_id: req.user.id,
            user_name: req.body.user_name || 'Khách hàng',
            type: type || 'review',
            rating: Number(rating) || 5,
            content,
            verified_buyer: false // Có thể kiểm tra đơn hàng sau
        });
        await newReview.save();
        res.status(201).json({ success: true, review: newReview });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Xóa đánh giá (chỉ chủ sở hữu)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const review = await ProductReview.findById(req.params.id);
        if (!review) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
        if (review.user_id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Không có quyền xóa' });
        }
        await review.deleteOne();
        res.json({ success: true, message: 'Đã xóa' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;