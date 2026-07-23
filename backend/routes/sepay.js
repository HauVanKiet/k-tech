const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');

// Lấy thông tin tài khoản ngân hàng từ .env
const BANK_CODE = process.env.BANK_CODE || 'MB';
const BANK_NUMBER = process.env.BANK_NUMBER || '1234567890';
const BANK_NAME = process.env.BANK_NAME || 'K_TECH COMPANY';
const SEPAY_WEBHOOK_SECRET = process.env.SEPAY_WEBHOOK_SECRET || '';
const SEPAY_API_TOKEN = process.env.SEPAY_API_TOKEN || '';

// Middleware xác thực HMAC-SHA256 từ SePay
const verifySePayHMAC = (req, res, next) => {
    if (!SEPAY_WEBHOOK_SECRET) {
        console.warn("⚠️ SEPAY_WEBHOOK_SECRET chưa được cấu hình, bỏ qua xác thực HMAC");
        return next();
    }

    const signature = req.headers['x-sepay-signature'];
    const timestamp = req.headers['x-sepay-timestamp'];
    
    if (!signature || !timestamp) {
        console.warn("❌ Thiếu header X-SEPAY-SIGNATURE hoặc X-SEPAY-TIMESTAMP");
        return res.status(401).json({ success: false, message: "Missing signature headers" });
    }

    const payload = JSON.stringify(req.body);
    const expected = 'sha256=' + crypto
        .createHmac('sha256', SEPAY_WEBHOOK_SECRET)
        .update(timestamp + '.' + payload)
        .digest('hex');

    try {
        const isValid = crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expected)
        );
        
        if (!isValid) {
            return res.status(401).json({ success: false, message: "Invalid signature" });
        }
    } catch (err) {
        return res.status(401).json({ success: false, message: "Signature comparison error" });
    }

    console.log("✅ Xác thực HMAC-SHA256 thành công");
    next();
};

// Webhook từ SePay
router.post('/webhook', verifySePayHMAC, async (req, res) => {
    try {
        const { transaction_id, amount, content, account_number, bank_code, transaction_date, status } = req.body;

        console.log("📩 SePay Webhook nhận được:", { transaction_id, amount, content, status });

        const orderCodeMatch = content?.match(/K_TECH_(\d+)/i);
        
        if (orderCodeMatch && status === 'success') {
            const orderCode = orderCodeMatch[0];
            console.log(`✅ Đã xác nhận thanh toán cho đơn hàng: ${orderCode}, số tiền: ${amount}đ`);
        }

        res.json({ success: true, message: "Webhook received successfully" });

    } catch (error) {
        console.error("❌ Lỗi webhook SePay:", error.message);
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

        res.json({ 
            success: true, 
            data: {
                bank: BANK_CODE,
                accountNumber: BANK_NUMBER,
                accountName: BANK_NAME,
                orderId: orderId,
                amount: parseInt(amount) || 0,
                content: `${customerName} ${orderId}`,
                qrUrl: qrUrl
            }
        });

    } catch (error) {
        console.error("❌ Lỗi tạo thanh toán:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// API kiểm tra giao dịch thực tế qua SePay
router.post('/verify', async (req, res) => {
    try {
        const { orderId, amount, customerName } = req.body;
        const searchContent = `${customerName} ${orderId}`;

        if (!SEPAY_API_TOKEN) {
            console.warn("⚠️ SEPAY_API_TOKEN chưa được cấu hình, bỏ qua kiểm tra");
            return res.json({ 
                success: true, 
                data: { verified: false, message: "Chưa thể xác minh tự động. Vui lòng thử lại sau." } 
            });
        }

        console.log(`🔍 Đang kiểm tra giao dịch: ${searchContent}, số tiền: ${amount}`);

        // Gọi SePay API để lấy danh sách giao dịch
        const response = await axios.get('https://my.sepay.vn/api/transactions', {
            headers: {
                'Authorization': `Bearer ${SEPAY_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            params: {
                limit: 20,
                page: 1
            },
            timeout: 10000
        });

        if (response.data && response.data.transactions) {
            const transactions = response.data.transactions;
            
            // Tìm giao dịch khớp với nội dung và số tiền
            const matched = transactions.find(tx => {
                const txContent = (tx.content || '').toLowerCase();
                const txAmount = parseInt(tx.amount) || 0;
                const searchLower = searchContent.toLowerCase();
                
                return txContent.includes(searchLower) && txAmount === parseInt(amount);
            });

            if (matched && matched.status === 'success') {
                console.log(`✅ Tìm thấy giao dịch khớp:`, matched.transaction_id);
                return res.json({ 
                    success: true, 
                    data: { 
                        verified: true, 
                        message: "Đã xác nhận giao dịch thành công!",
                        transaction: matched 
                    } 
                });
            }
        }

        console.log(`❌ Chưa tìm thấy giao dịch khớp cho: ${searchContent}`);
        res.json({ 
            success: true, 
            data: { 
                verified: false, 
                message: "Chưa nhận được tiền. Vui lòng kiểm tra lại hoặc thử lại sau." 
            } 
        });

    } catch (error) {
        console.error("❌ Lỗi kiểm tra giao dịch SePay:", error.message);
        res.json({ 
            success: true, 
            data: { 
                verified: false, 
                message: "Lỗi kết nối SePay. Vui lòng thử lại sau." 
            } 
        });
    }
});

// API kiểm tra trạng thái thanh toán
router.get('/check/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        res.json({
            success: true,
            data: { orderId, status: 'pending', message: 'Đang chờ thanh toán' }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;