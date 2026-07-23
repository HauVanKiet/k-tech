const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Lấy thông tin tài khoản ngân hàng từ .env
const BANK_CODE = process.env.BANK_CODE || 'MB';
const BANK_NUMBER = process.env.BANK_NUMBER || '1234567890';
const BANK_NAME = process.env.BANK_NAME || 'K_TECH COMPANY';
const SEPAY_WEBHOOK_SECRET = process.env.SEPAY_WEBHOOK_SECRET || '';

// Middleware xác thực HMAC-SHA256 từ SePay
const verifySePayHMAC = (req, res, next) => {
    if (!SEPAY_WEBHOOK_SECRET) {
        console.warn("⚠️ SEPAY_WEBHOOK_SECRET chưa được cấu hình, bỏ qua xác thực HMAC");
        return next();
    }

    // SePay gửi chữ ký trong headers
    const signature = req.headers['x-sepay-signature'];
    const timestamp = req.headers['x-sepay-timestamp'];
    
    if (!signature || !timestamp) {
        console.warn("❌ Thiếu header X-SEPAY-SIGNATURE hoặc X-SEPAY-TIMESTAMP, từ chối request");
        return res.status(401).json({ success: false, message: "Missing signature headers" });
    }

    // Lấy raw body
    const payload = JSON.stringify(req.body);
    
    // Tạo chữ ký theo format: sha256=HMAC-SHA256(timestamp.payload, secret)
    const expected = 'sha256=' + crypto
        .createHmac('sha256', SEPAY_WEBHOOK_SECRET)
        .update(timestamp + '.' + payload)
        .digest('hex');

    // So sánh chữ ký (dùng timing-safe comparison)
    try {
        const isValid = crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expected)
        );
        
        if (!isValid) {
            console.warn("❌ Chữ ký HMAC không khớp, có thể là request giả mạo");
            return res.status(401).json({ success: false, message: "Invalid signature" });
        }
    } catch (err) {
        console.warn("❌ Lỗi so sánh HMAC:", err.message);
        return res.status(401).json({ success: false, message: "Signature comparison error" });
    }

    console.log("✅ Xác thực HMAC-SHA256 thành công");
    next();
};

// Webhook từ SePay - có xác thực HMAC
router.post('/webhook', verifySePayHMAC, async (req, res) => {
    try {
        const { 
            transaction_id,
            amount,
            content,
            account_number,
            bank_code,
            transaction_date,
            status 
        } = req.body;

        console.log("📩 SePay Webhook nhận được:");
        console.log("- Mã GD:", transaction_id);
        console.log("- Số tiền:", amount);
        console.log("- Nội dung:", content);
        console.log("- Trạng thái:", status);

        // Kiểm tra nội dung chuyển khoản có chứa mã đơn hàng không
        const orderCodeMatch = content?.match(/K_TECH_(\d+)/i);
        
        if (orderCodeMatch && status === 'success') {
            const orderCode = orderCodeMatch[0];
            const amountNum = parseInt(amount) || 0;
            
            console.log(`✅ Đã xác nhận thanh toán cho đơn hàng: ${orderCode}, số tiền: ${amountNum}đ`);
            
            // Ở đây bạn có thể cập nhật trạng thái đơn hàng trong Database
        }

        res.json({ 
            success: true, 
            message: "Webhook received successfully" 
        });

    } catch (error) {
        console.error("❌ Lỗi xử lý webhook SePay:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// API tạo thông tin chuyển khoản + QR
router.post('/create-payment', async (req, res) => {
    try {
        const { amount, customerName } = req.body;

        const timestamp = Date.now().toString().slice(-6);
        const orderId = `K_TECH_${timestamp}`;

        const qrUrl = `https://img.vietqr.io/image/${BANK_CODE}-${BANK_NUMBER}-compact2.jpg?amount=${parseInt(amount) || 0}&addInfo=${encodeURIComponent(customerName + ' ' + orderId)}&accountName=${encodeURIComponent(BANK_NAME)}`;

        const bankInfo = {
            bank: BANK_CODE,
            accountNumber: BANK_NUMBER,
            accountName: BANK_NAME,
            orderId: orderId,
            amount: parseInt(amount) || 0,
            content: `${customerName} ${orderId}`,
            qrUrl: qrUrl
        };

        res.json({ success: true, data: bankInfo });

    } catch (error) {
        console.error("❌ Lỗi tạo thanh toán:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// API kiểm tra trạng thái thanh toán
router.get('/check/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        
        res.json({
            success: true,
            data: {
                orderId: orderId,
                status: 'pending',
                message: 'Đang chờ thanh toán'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;