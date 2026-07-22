const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Dùng để mã hóa mật khẩu Admin
require('dotenv').config();

// Nhập Model User để thao tác với Database
const User = require('./models/User'); 

const app = express();

// Cấu hình Middleware
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));

// Kết nối Cơ sở dữ liệu MongoDB và tự động tạo Admin nếu chưa có
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("👉 Đã kết nối cơ sở dữ liệu K_Tech thành công!");
        
        // Cấu hình thông tin tài khoản Admin cố định theo yêu cầu của bạn
        const adminEmail = (process.env.ADMIN_EMAIL || "Ravens1706@gmail.com").trim().toLowerCase();
        const adminPassword = process.env.ADMIN_PASSWORD || "Ctrlshift1";
        const adminExist = await User.findOne({ email: { $regex: new RegExp(`^${adminEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });
        
        if (!adminExist) {
            // Mã hóa mật khẩu bảo mật trước khi lưu vào DB
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            
            const adminAccount = new User({
                fullName: "Quản Trị Viên K_Tech",
                username: "admin_ktech",
                phone: "0123456789",
                birthDate: "2026-01-01",
                email: adminEmail,
                password: hashedPassword,
                role: "admin" // Gán quyền tối cao cho Admin
            });
            
            await adminAccount.save();
            console.log("👑 Đã khởi tạo thành công tài khoản Admin cố định vào hệ thống!");
        } else {
            if (adminExist.email !== adminEmail) {
                adminExist.email = adminEmail;
                await adminExist.save();
            }
            console.log("🔒 Tài khoản Admin cố định đã sẵn sàng hoạt động.");
        }
    })
    .catch(err => {
        console.log("❌ Lỗi kết nối cơ sở dữ liệu: ", err.message);
    });

// Định tuyến một đường dẫn kiểm tra (Test Route)
app.get('/', (req, res) => {
    res.send("🚀 Server K_Tech đang hoạt động hoàn hảo!");
});

// ==================== ĐỊNH TUYẾN CÁC ROUTE CHỨC NĂNG ====================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/product')); // Quản lý sản phẩm đăng bán
app.use('/api/sepay', require('./routes/sepay')); // SePay thanh toán
// app.use('/api/buyback', require('./routes/buyback')); // Đang khóa tạm thời chức năng thu máy

// ==================== KHỞI CHẠY SERVER (LUÔN Ở CUỐI FILE) ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server K_Tech đang chạy tại port: ${PORT}`);
    console.log(`👉 Bạn có thể mở trình duyệt và truy cập: http://localhost:${PORT}`);
});