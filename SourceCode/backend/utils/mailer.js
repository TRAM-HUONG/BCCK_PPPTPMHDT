// backend/utils/mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// 1. Hàm gửi thông báo kế hoạch học tập (Dành cho Cố vấn)
const sendPlanNotification = async (toEmail, hoTenSV, trangThai, noiDungGopY) => {
    try {
        if (!toEmail) return;

        const isApproved = trangThai === 'DaDuyet';
        const subject = isApproved 
            ? '[Hệ thống Cố vấn học tập] Kế hoạch học tập đã được phê duyệt' 
            : '[Hệ thống Cố vấn học tập] Yêu cầu chỉnh sửa kế hoạch học tập';

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h3 style="color: #2b579a;">Xin chào ${hoTenSV},</h3>
                <p>Cố vấn học tập của bạn đã xem xét và đưa ra phản hồi về kế hoạch học tập:</p>
                <p><strong>Trạng thái:</strong> <span style="color: ${isApproved ? '#52c41a' : '#ff4d4f'}; font-weight: bold;">
                    ${isApproved ? 'ĐÃ PHÊ DUYỆT' : 'YÊU CẦU CHỈNH SỬA'}
                </span></p>
                <p><strong>Ý kiến góp ý / Nhận xét từ cố vấn:</strong></p>
                <div style="background: #f8f9fa; padding: 12px; border-left: 4px solid ${isApproved ? '#52c41a' : '#ff4d4f'}; margin-bottom: 15px;">
                    ${noiDungGopY}
                </div>
                <p>Vui lòng đăng nhập vào hệ thống để kiểm tra chi tiết.</p>
                <p style="font-size: 0.9rem; color: #666; margin-top: 30px;">Trân trọng,<br/>Hệ thống Quản lý Cố vấn Học tập</p>
            </div>
        `;

        await transporter.sendMail({
            from: `"Hệ thống Cố vấn học tập" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: subject,
            html: htmlContent,
        });

        console.log(`Đã gửi email thông báo kế hoạch thành công đến: ${toEmail}`);
    } catch (error) {
        console.error('Lỗi khi gửi email thông báo kế hoạch:', error);
    }
};

// 2. Hàm gửi email tổng quát (Dành cho Reset mật khẩu và các tính năng khác)
const sendEmail = async (toEmail, subject, htmlContent) => {
    try {
        if (!toEmail) return;

        await transporter.sendMail({
            from: `"Hệ thống Quản lý" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: subject,
            html: htmlContent,
        });

        console.log(`Đã gửi email chung thành công đến: ${toEmail}`);
    } catch (error) {
        console.error('Lỗi khi gửi email chung:', error);
    }
};

module.exports = { sendPlanNotification, sendEmail };