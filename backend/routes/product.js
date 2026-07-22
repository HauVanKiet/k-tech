const express = require('express');
const router = express.Router();
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const Product = require('../models/Product'); 
const jwt = require('jsonwebtoken');

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({ 
    cloudinary: cloudinary,
    params: {
        folder: 'K_Tech_Products', 
        upload_preset: 'K_Tech_Products', // Thêm dòng này vào để khớp với cấu hình Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

const upload = multer({ storage: storage });

// Middleware to check admin via JWT
const authAdmin = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Không có token' });
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (verified.role !== 'admin') return res.status(403).json({ message: 'Yêu cầu quyền admin' });
        req.user = verified;
        next();
    } catch (err) { return res.status(400).json({ message: 'Token không hợp lệ' }); }
};

// Thay vì upload.single, ta dùng upload.array và đặt giới hạn là 8 ảnh
router.post('/add', upload.array('images', 8), async (req, res) => {
    try {
        const { name, price, description, category, condition, quantity, stockStatus, warranty } = req.body;
        
        // Kiểm tra nếu admin không chọn ảnh nào
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: "Vui lòng chọn ít nhất 1 ảnh sản phẩm!" });
        }

        // Lấy tất cả các đường dẫn link ảnh trả về từ Cloudinary gom vào 1 mảng
        const uploadedImages = req.files.map(file => file.path);

        // Quy ước: Ảnh đầu tiên trong mảng (vị trí số 0) sẽ làm ảnh bìa
        const coverImageUrl = uploadedImages[0];

        const newProduct = new Product({
            name,
            price,
            description,
            category,
            condition: condition || 'mới',
            quantity: Number(quantity) || 0,
            stockStatus: stockStatus || 'còn hàng',
            warranty: warranty || '',
            coverImage: coverImageUrl, // Lưu ảnh bìa
            images: uploadedImages     // Lưu toàn bộ danh sách ảnh
        });

        await newProduct.save();
        res.status(201).json({ success: true, message: "Đăng bán sản phẩm với nhiều ảnh thành công!" });

    } catch (error) {
        console.error("Lỗi thêm sản phẩm:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống: " + error.message });
    }
});

// API 2: Lấy tất cả sản phẩm -> ĐƯỜNG DẪN THỰC TẾ SẼ LÀ: http://localhost:5000/api/products/all
router.get('/all', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// API 3: Lấy chi tiết 1 sản phẩm theo ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
        }
        res.status(200).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update product (admin)
// Update product (admin) - supports removing existing images and uploading new ones
router.put('/:id', authAdmin, upload.array('newImages', 8), async (req, res) => {
    try {
        const { name, price, description, category, imagesToRemove, condition, quantity, stockStatus, warranty } = req.body;

        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });

        // Remove images if requested
        let removeList = [];
        if (imagesToRemove) {
            try { removeList = JSON.parse(imagesToRemove); } catch (e) { removeList = Array.isArray(imagesToRemove) ? imagesToRemove : [imagesToRemove]; }
        }

        // Helper to get public_id from cloudinary url
        const getPublicIdFromUrl = (url) => {
            try {
                const parts = url.split('/upload/');
                if (parts.length < 2) return null;
                let tail = parts[1];
                // remove version prefix like v123456/
                tail = tail.replace(/^v[0-9]+\//, '');
                // remove file extension
                tail = tail.replace(/\.[a-zA-Z0-9]+(\?.*)?$/, '');
                return tail;
            } catch (err) { return null; }
        };

        for (const url of removeList) {
            const publicId = getPublicIdFromUrl(url);
            if (publicId) {
                try { await cloudinary.uploader.destroy(publicId); } catch (e) { console.warn('Cloudinary destroy failed', publicId, e.message); }
            }
        }

        // Filter out removed images from product.images
        if (removeList.length > 0) {
            product.images = (product.images || []).filter(img => !removeList.includes(img));
        }

        // Add newly uploaded images (if any)
        if (req.files && req.files.length > 0) {
            const uploaded = req.files.map(f => f.path);
            product.images = (product.images || []).concat(uploaded);
        }

        // Ensure coverImage remains first image if available
        if (product.images && product.images.length > 0) product.coverImage = product.images[0];

        // Update other fields
        product.name = name;
        product.price = price;
        product.description = description;
        product.category = category;
        product.condition = condition || product.condition || 'mới';
        product.quantity = Number(quantity) ?? product.quantity ?? 0;
        product.stockStatus = stockStatus || product.stockStatus || 'còn hàng';
        product.warranty = warranty !== undefined ? warranty : product.warranty;

        await product.save();
        res.json({ success: true, product });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Delete product (admin)
router.delete('/:id', authAdmin, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Đã xóa sản phẩm' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;