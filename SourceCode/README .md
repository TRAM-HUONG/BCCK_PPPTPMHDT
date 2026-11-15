

## ⚙️ Hướng dẫn cài đặt và chạy chương trình

### 1. Yêu cầu hệ thống
* Đã cài đặt [Node.js](https://nodejs.org/) (phiên bản v18 trở lên).
* Đã cài đặt **Microsoft SQL Server** và **SQL Server Management Studio (SSMS)** 

### 2. Khởi tạo Cơ sở dữ liệu (SQL Server)
1. Mở **SQL Server Management Studio (SSMS)** và đăng nhập vào SQL Server.
2. Tạo một cơ sở dữ liệu mới cho dự án.
3. Mở tệp **`SQL.sql`** của dự án, chọn đúng database vừa tạo và nhấn **Execute (F5)** để khởi tạo các bảng và dữ liệu ban đầu.

### 3. Cài đặt và chạy Backend
Mở Terminal và di chuyển vào thư mục `backend`:
```bash
cd BCCK_PPPT/backend
```

Cài đặt các gói thư viện phụ thuộc từ `package.json`:
```bash
npm install
```
*(Nếu chưa có tệp `package.json` hoặc cần cài đặt thủ công đầy đủ các thư viện của dự án, chạy lệnh sau)*:
```bash
npm init -y
npm install express mssql msnodesqlv8 cors dotenv bcryptjs jsonwebtoken multer xlsx csv-parser nodemailer
```

Tạo hoặc kiểm tra file `.env` trong thư mục `backend/` và điền các thông số kết nối SQL Server của máy bạn:
```env
PORT=5000
DB_SERVER=localhost
DB_USER=sa
DB_PASSWORD=your_sql_server_password
DB_DATABASE=your_database_name
DB_PORT=1433
JWT_SECRET=your_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

Khởi chạy server Backend:
```bash
node server.js
```

### 4. Cài đặt và chạy Frontend
Mở một cửa sổ Terminal mới (giữ nguyên Terminal của Backend đang chạy) và di chuyển vào thư mục `frontend`:
```bash
cd BCCK_PPPT/frontend
```

Cài đặt các gói thư viện từ `package.json`:
```bash
npm install
```
*(Hoặc cài đặt thủ công đầy đủ các thư viện giao diện cần thiết)*:
```bash
npm install react react-dom react-router-dom axios
```

Khởi chạy ứng dụng Frontend:
```bash
npm run dev
```

Sau khi biên dịch hoàn tất, mở trình duyệt và truy cập vào địa chỉ hiển thị trên Terminal (mặc định là **`http://localhost:5173/`**).
