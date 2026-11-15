// controllers/authController.js
const nodemailer = require('nodemailer');
const AuthModel = require('../models/authModel'); // Import Model vừa tạo

// Cấu hình transporter gửi email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.login = async (req, res) => {
    try {
        const { email, matKhau } = req.body;
        
        // Gọi Model để tìm tài khoản
        const user = await AuthModel.findByCredentials(email, matKhau);

        if (user) {
            // Lấy thông tin bổ sung dựa vào vai trò qua Model
            const extraInfo = await AuthModel.getExtraInfo(user.MaTK, user.VaiTro);

            res.status(200).json({ 
                success: true, 
                message: 'Đăng nhập thành công', 
                data: { ...user, ...extraInfo } 
            });
        } else {
            res.status(401).json({ success: false, message: 'Sai email hoặc mật khẩu, vui lòng thử lại.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getSinhVienList = async (req, res) => {
    try {
        const { keyword } = req.query;
        // Gọi Model lấy danh sách
        const data = await AuthModel.getSinhVienList(keyword);
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // 1. Kiểm tra email có tồn tại không qua Model
        const user = await AuthModel.findByEmail(email);

        if (!user) {
            return res.status(404).json({ success: false, error: 'Email không tồn tại trong hệ thống!' });
        }

        // 2. Tạo mật khẩu ngẫu nhiên mới
        const newPassword = Math.random().toString(36).slice(-6);

        // 3. Cập nhật mật khẩu mới vào CSDL qua Model
        await AuthModel.updatePassword(email, newPassword);

        // 4. Gửi email chứa mật khẩu mới
        const mailOptions = {
            from: 'Hệ Thống Trợ Lý Lập Kế Hoạch Học Tập <no-reply@studyplanner.com>',
            to: email,
            subject: 'Khôi phục mật khẩu thành công',
            text: `Xin chào,\n\nBạn đã yêu cầu reset mật khẩu trên hệ thống.\nMật khẩu mới của bạn là: ${newPassword}\n\nVui lòng đăng nhập lại và đổi mật khẩu mới để bảo mật tài khoản.`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: 'Mật khẩu mới đã được gửi về email của bạn!' });
    } catch (error) {
        console.error('Lỗi reset mật khẩu:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};