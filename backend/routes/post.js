const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Bắt buộc phải đăng nhập" });
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) { res.status(400).json({ message: "Token không hợp lệ" }); }
};

// Lấy danh sách bài đăng đã xuất bản (public - cho trang tin tức)
router.get('/published', async (req, res) => {
    try {
        const posts = await Post.find({ status: 'published' }).sort({ createdAt: -1 });
        res.json({ success: true, posts });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Lấy chi tiết 1 bài đăng (public)
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Không tìm thấy bài đăng' });
        res.json({ success: true, post });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Lấy toàn bộ bài đăng (admin - gồm cả bản nháp)
router.get('/admin/all', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Từ chối quyền truy cập" });
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json({ success: true, posts });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Tạo bài đăng mới (admin)
router.post('/', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Từ chối quyền truy cập" });
    try {
        const { title, category, excerpt, content, coverImage, author, status } = req.body;
        if (!title || !title.trim()) return res.status(400).json({ success: false, message: 'Vui lòng nhập tiêu đề' });
        if (!content || !content.trim()) return res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung' });

        const newPost = new Post({
            title: title.trim(),
            category: category || 'Tin tức',
            excerpt: excerpt || '',
            content,
            coverImage: coverImage || '',
            author: author || 'K_Tech',
            status: status || 'published'
        });
        await newPost.save();
        res.status(201).json({ success: true, post: newPost });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Cập nhật bài đăng (admin)
router.put('/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Từ chối quyền truy cập" });
    try {
        const { title, category, excerpt, content, coverImage, author, status } = req.body;
        const update = {};
        if (title !== undefined) update.title = title.trim();
        if (category !== undefined) update.category = category;
        if (excerpt !== undefined) update.excerpt = excerpt;
        if (content !== undefined) update.content = content;
        if (coverImage !== undefined) update.coverImage = coverImage;
        if (author !== undefined) update.author = author;
        if (status !== undefined) update.status = status;

        const updated = await Post.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!updated) return res.status(404).json({ success: false, message: 'Không tìm thấy bài đăng' });
        res.json({ success: true, post: updated });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Xóa bài đăng (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Từ chối quyền truy cập" });
    try {
        const deleted = await Post.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Không tìm thấy bài đăng' });
        res.json({ success: true, message: 'Đã xóa bài đăng' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;