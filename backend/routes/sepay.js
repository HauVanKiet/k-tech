const express = require('express');
const router = express.Router();

// Lấy thông tin tài khoản ngân hàng từ .env
const BANK_CODE = process.env.BANK_CODE || 'MB';          // Mã ngân hàng (MB, VCB, ACB, TPB,...)
const BANK_NUMBER = process.env.BANK_NUMBER || '1234567890'; // Số tài khoản
const BANK_NAME = process.env.BANK_NAME || 'K_TECH COMPANY'; // Chủ tài khoản

// Webhook từ SePay để xác nhận giao dịch
router.post('/webhook', async (req, res) => {
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

        // Tạo mã đơn hàng
        const timestamp = Date.now().toString().slice(-6);
        const orderId = `K_TECH_${timestamp}`;

        // Tạo URL QR VietQR
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