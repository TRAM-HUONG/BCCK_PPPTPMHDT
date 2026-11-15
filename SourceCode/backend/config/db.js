const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
    user: 'sa_admin',         // Tên đăng nhập (như trong câu lệnh SQL của bạn)
    password: '123456',       // Mật khẩu (như trong câu lệnh SQL của bạn)
    server: 'ADMIN-PC',       // Tên Server (như trong câu lệnh SQL của bạn)
    database: 'StudyPlannerDB', // Tên database
    options: {
        encrypt: false,       // Tắt mã hóa cho môi trường local
        trustServerCertificate: true // Cho phép chứng chỉ tự ký
    }
};
const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log('Kết nối SQL Server thành công!');
        return pool;
    })
    .catch(err => console.log('Kết nối cơ sở dữ liệu thất bại: ', err));

module.exports = { sql, poolPromise };