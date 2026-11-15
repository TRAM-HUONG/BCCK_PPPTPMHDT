# Hệ Thống Quản Lý Chương Trình Đào Tạo & Cố Vấn Học Tập (BCCK_PPPT)

Dự án **BCCK_PPPT** là ứng dụng web hỗ trợ quản lý đào tạo, theo dõi tiến độ học tập, mô phỏng lộ trình và tư vấn môn học dành cho sinh viên, cố vấn học tập và quản trị viên.

## 🚀 Tính năng chính

* **Phân quyền & Xác thực (`auth`):** Đăng nhập, quản lý tài khoản và phân quyền người dùng (Sinh viên, Cố vấn học tập, Admin).
* **Quản lý Chương trình đào tạo (`ctdt`, `ctdtAdmin`):** Xem và quản lý khung chương trình đào tạo, danh sách học phần.
* **Quản lý Môn tiên quyết (`prerequisite`):** Thiết lập và kiểm tra điều kiện tiên quyết giữa các môn học.
* **Lập kế hoạch & Mô phỏng học tập (`plan`, `simulation`):** Hỗ trợ sinh viên lên kế hoạch đăng ký môn học và mô phỏng kết quả/lộ trình tốt nghiệp.
* **Cố vấn học tập (`advisor`):** Hỗ trợ giảng viên/cố vấn theo dõi tình hình học tập và tư vấn cho sinh viên.
* **Quản lý Điểm số & Hệ thống (`admin`, `adminGrade`):** Quản trị viên nhập, quản lý điểm số (hỗ trợ import file Excel/CSV) và cấu hình dữ liệu hệ thống.

## 🏗️ Cấu trúc thư mục

```text
BCCK_PPPT/
├── backend/                # Mã nguồn phía Server (Node.js / Express)
│   ├── config/             # Cấu hình kết nối SQL Server & hệ thống
│   ├── controllers/        # Xử lý logic nghiệp vụ (admin, advisor, auth, ctdt, plan, simulation...)
│   ├── models/             # Định nghĩa schema/models dữ liệu
│   ├── routes/             # Định tuyến các API endpoints
│   ├── utils/              # Các hàm tiện ích dùng chung
│   ├── .env                # Biến môi trường (Port, DB Config, JWT Secret, Email...)
│   ├── package.json        # Danh sách thư viện phụ thuộc của Backend
│   └── server.js           # File khởi chạy chính của Server
└── frontend/               # Mã nguồn phía Client (ReactJS & Vite)
```

## 🛠️ Công nghệ & Thư viện sử dụng

* **Backend (Node.js & Express):**
  * `express`: Framework xây dựng RESTful API.
  * `mssql`, `msnodesqlv8`: Kết nối và truy vấn cơ sở dữ liệu Microsoft SQL Server.
  * `cors`: Xử lý quyền truy cập tài nguyên chéo (Cross-Origin Resource Sharing).
  * `dotenv`: Quản lý các biến môi trường từ tệp `.env`.
  * `bcryptjs`: Mã hóa mật khẩu người dùng.
  * `jsonwebtoken`: Tạo và xác thực token phiên đăng nhập (JWT).
  * `multer`, `xlsx`, `csv-parser`: Xử lý tải tệp lên và đọc dữ liệu bảng điểm từ Excel/CSV.
  * `nodemailer`: Gửi email thông báo và cấp lại mật khẩu.
* **Frontend (ReactJS & Vite):**
  * `react`, `react-dom`: Thư viện xây dựng giao diện người dùng.
  * `react-router-dom`: Điều hướng trang và phân quyền route.
  * `axios`: Gửi yêu cầu HTTP gọi API từ Backend.
  * `vite`: Công cụ đóng gói và chạy máy chủ phát triển.
* **Database:** Microsoft SQL Server.

---

## ⚙️ Hướng dẫn cài đặt và chạy chương trình

### 1. Yêu cầu hệ thống
* Đã cài đặt [Node.js](https://nodejs.org/) (phiên bản v18 trở lên).
* Đã cài đặt **Microsoft SQL Server** và **SQL Server Management Studio (SSMS)** (đảm bảo đã bật giao thức **TCP/IP** cổng `1433` trong *SQL Server Configuration Manager*).

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