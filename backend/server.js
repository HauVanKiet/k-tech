const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User'); 

const app = express();

// Cấu hình CORS - cho phép tất cả origin khi deploy
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', ...(process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : [])],
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("👉 Đã kết nối cơ sở dữ liệu K_Tech thành công!");
        
        const adminEmail = (process.env.ADMIN_EMAIL || "Ravens1706@gmail.com").trim().toLowerCase();
        const adminPassword = process.env.ADMIN_PASSWORD || "Ctrlshift1";
        const adminExist = await User.findOne({ email: { $regex: new RegExp(`^${adminEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });
        
        if (!adminExist) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            const adminAccount = new User({
                fullName: "Quản Trị Viên K_Tech",
                username: "admin_ktech",
                phone: "0123456789",
                birthDate: "2026-01-01",
                email: adminEmail,
                password: hashedPassword,
                role: "admin"
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

app.get('/', (req, res) => {
    res.send("🚀 Server K_Tech đang hoạt động hoàn hảo!");
});

// ==================== ĐỊNH TUYẾN CÁC ROUTE CHỨC NĂNG ====================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/product'));
app.use('/api/sepay', require('./routes/sepay'));
app.use('/api/buyback', require('./routes/buyback'));

// ==================== KHỞI CHẠY SERVER ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server K_Tech đang chạy tại port: ${PORT}`);
    console.log(`👉 Bạn có thể mở trình duyệt và truy cập: http://localhost:${PORT}`);
});