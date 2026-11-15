-- =====================================================================
-- 1. XÓA CƠ SỞ DỮ LIỆU CŨ VÀ TẠO MỚI HOÀN TOÀN
-- =====================================================================
USE master;
GO

IF EXISTS (SELECT * FROM sys.databases WHERE name = 'StudyPlannerDB')
BEGIN
    ALTER DATABASE StudyPlannerDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE StudyPlannerDB;
END
GO

CREATE DATABASE StudyPlannerDB;
GO

USE StudyPlannerDB;
GO

-- =====================================================================
-- 2. TẠO CÁC BẢNG HỆ THỐNG
-- =====================================================================

CREATE TABLE TaiKhoan (
    MaTK VARCHAR(20) PRIMARY KEY,
    Email VARCHAR(100) UNIQUE NOT NULL,
    MatKhau VARCHAR(255) NOT NULL,
    VaiTro VARCHAR(20) CHECK (VaiTro IN ('SinhVien', 'GiangVien', 'Admin')) NOT NULL,
    TrangThai BIT DEFAULT 1
);
GO

CREATE TABLE Admin (
    MaAdmin VARCHAR(20) PRIMARY KEY,
    MaTK VARCHAR(20) UNIQUE NOT NULL FOREIGN KEY REFERENCES TaiKhoan(MaTK) ON DELETE CASCADE,
    HoTen NVARCHAR(100) NOT NULL,
    QuyenHanQuanTri NVARCHAR(100) DEFAULT N'Toàn quyền hệ thống'
);
GO

CREATE TABLE GiangVien (
    MaCoVan VARCHAR(20) PRIMARY KEY,
    MaTK VARCHAR(20) UNIQUE NOT NULL FOREIGN KEY REFERENCES TaiKhoan(MaTK) ON DELETE CASCADE,
    HoTen NVARCHAR(100) NOT NULL,
    ChuyenMon NVARCHAR(150) NULL,
    LopPhuTrach VARCHAR(50) NULL
);
GO

CREATE TABLE ChuyenNganh (
    MaNganh VARCHAR(20) PRIMARY KEY,
    TenNganh NVARCHAR(150) NOT NULL,
    KhoaHoc VARCHAR(20) NOT NULL
);
GO

CREATE TABLE SinhVien (
    MaSinhVien VARCHAR(20) PRIMARY KEY,
    MaTK VARCHAR(20) UNIQUE NOT NULL FOREIGN KEY REFERENCES TaiKhoan(MaTK) ON DELETE CASCADE,
    HoTen NVARCHAR(100) NOT NULL,
    Lop VARCHAR(50) NOT NULL,
    MaNganh VARCHAR(20) FOREIGN KEY REFERENCES ChuyenNganh(MaNganh),
    MaCoVan VARCHAR(20) FOREIGN KEY REFERENCES GiangVien(MaCoVan),
    GPA_TichLuy DECIMAL(3,2) DEFAULT 0.00,
    TongTinChiTichLuy INT DEFAULT 0
);
GO

CREATE TABLE HocPhan (
    MaHocPhan VARCHAR(20) PRIMARY KEY,
    TenHocPhan NVARCHAR(150) NOT NULL,
    SoTinChi INT CHECK (SoTinChi > 0) NOT NULL,
    PhanLoai NVARCHAR(30) CHECK (PhanLoai IN ('BatBuoc', 'TuChon')) NOT NULL,
    MaNganh VARCHAR(20) FOREIGN KEY REFERENCES ChuyenNganh(MaNganh),
    HocKyGoiY INT NOT NULL
);
GO

CREATE TABLE RangBuocHocPhan (
    MaRB VARCHAR(20) PRIMARY KEY,
    MaHocPhan VARCHAR(20) FOREIGN KEY REFERENCES HocPhan(MaHocPhan),
    MaHocPhanDieuKien VARCHAR(20) FOREIGN KEY REFERENCES HocPhan(MaHocPhan),
    LoaiRangBuoc VARCHAR(20) CHECK (LoaiRangBuoc IN ('TienQuyet', 'HocTruoc', 'SongHanh')) NOT NULL,
    CONSTRAINT UQ_RangBuoc UNIQUE (MaHocPhan, MaHocPhanDieuKien)
);
GO

CREATE TABLE BangDiem (
    MaBangDiem VARCHAR(20) PRIMARY KEY,
    MaSinhVien VARCHAR(20) FOREIGN KEY REFERENCES SinhVien(MaSinhVien),
    MaHocPhan VARCHAR(20) FOREIGN KEY REFERENCES HocPhan(MaHocPhan),
    DiemSo DECIMAL(4,2) CHECK (DiemSo >= 0 AND DiemSo <= 10),
    TrangThaiDat BIT NOT NULL, 
    HocKyHoanThanh VARCHAR(20) NOT NULL
);
GO

CREATE TABLE KeHoachHocTap (
    MaKeHoach INT IDENTITY(1,1) PRIMARY KEY,
    MaSinhVien VARCHAR(20) FOREIGN KEY REFERENCES SinhVien(MaSinhVien),
    HocKyMucTieu VARCHAR(20) NOT NULL,
    TongSoTinChi INT NOT NULL,
    TrangThaiDuyet NVARCHAR(30) CHECK (TrangThaiDuyet IN ('BanThao', 'ChoDuyet', 'DaDuyet', 'YeuCauChinhSua')) DEFAULT 'BanThao',
    NgayTao DATETIME DEFAULT GETDATE(),
    NgayCapNhat DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE ChiTietKeHoach (
    MaCT VARCHAR(20) PRIMARY KEY,
    MaKeHoach INT FOREIGN KEY REFERENCES KeHoachHocTap(MaKeHoach) ON DELETE CASCADE,
    MaHocPhan VARCHAR(20) FOREIGN KEY REFERENCES HocPhan(MaHocPhan),
    TrangThaiMon NVARCHAR(30) CHECK (TrangThaiMon IN ('DeXuat', 'Khoa', 'TuDangKy')) NOT NULL,
    LyDoGiaiThich NVARCHAR(500) NULL
);
GO

CREATE TABLE LichSuMoPhong (
    MaMoPhong INT IDENTITY(1,1) PRIMARY KEY,
    MaSinhVien VARCHAR(20) FOREIGN KEY REFERENCES SinhVien(MaSinhVien),
    TenKichBan NVARCHAR(150) NOT NULL,
    DuLieuGiaLap VARCHAR(MAX) NOT NULL,
    GPA_DuKien DECIMAL(4,2),
    NgayMoPhong DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE PhanHoiCoVan (
    MaPhanHoi INT IDENTITY(1,1) PRIMARY KEY,
    MaKeHoach INT FOREIGN KEY REFERENCES KeHoachHocTap(MaKeHoach) ON DELETE CASCADE,
    MaCoVan VARCHAR(20) FOREIGN KEY REFERENCES GiangVien(MaCoVan),
    NoiDungGopY NVARCHAR(MAX) NOT NULL,
    TrangThaiPhanHoi NVARCHAR(30) CHECK (TrangThaiPhanHoi IN ('PheDuyet', 'YeuCauChinhSua')) NOT NULL,
    NgayPhanHoi DATETIME DEFAULT GETDATE()
);
GO


-- =====================================================================
-- 3. CHÈN DỮ LIỆU MẪU (ÍT NHẤT 10 BẢN GHI CHO MỖI BẢNG)
-- =====================================================================

-- 3.1. Tài khoản (2 Admin, 10 Giảng Viên, 10 Sinh Viên)
INSERT INTO TaiKhoan (MaTK, Email, MatKhau, VaiTro, TrangThai) VALUES
('TK_AD01', 'admin01@university.edu.vn', '123456', 'Admin', 1),
('TK_AD02', 'admin02@university.edu.vn', '123456', 'Admin', 1),
('TK_GV01', 'gv01@university.edu.vn', '123456', 'GiangVien', 1),
('TK_GV02', 'gv02@university.edu.vn', '123456', 'GiangVien', 1),
('TK_GV03', 'gv03@university.edu.vn', '123456', 'GiangVien', 1),
('TK_GV04', 'gv04@university.edu.vn', '123456', 'GiangVien', 1),
('TK_GV05', 'gv05@university.edu.vn', '123456', 'GiangVien', 1),
('TK_GV06', 'gv06@university.edu.vn', '123456', 'GiangVien', 1),
('TK_GV07', 'gv07@university.edu.vn', '123456', 'GiangVien', 1),
('TK_GV08', 'gv08@university.edu.vn', '123456', 'GiangVien', 1),
('TK_GV09', 'gv09@university.edu.vn', '123456', 'GiangVien', 1),
('TK_GV10', 'gv10@university.edu.vn', '123456', 'GiangVien', 1),
('TK_SV01', 'sv01@student.edu.vn', '123456', 'SinhVien', 1),
('TK_SV02', 'sv02@student.edu.vn', '123456', 'SinhVien', 1),
('TK_SV03', 'sv03@student.edu.vn', '123456', 'SinhVien', 1),
('TK_SV04', 'sv04@student.edu.vn', '123456', 'SinhVien', 1),
('TK_SV05', 'sv05@student.edu.vn', '123456', 'SinhVien', 1),
('TK_SV06', 'sv06@student.edu.vn', '123456', 'SinhVien', 1),
('TK_SV07', 'sv07@student.edu.vn', '123456', 'SinhVien', 1),
('TK_SV08', 'sv08@student.edu.vn', '123456', 'SinhVien', 1),
('TK_SV09', 'sv09@student.edu.vn', '123456', 'SinhVien', 1),
('TK_SV10', 'sv10@student.edu.vn', '123456', 'SinhVien', 1);
GO

-- 3.2. Admin (2 bản ghi)
INSERT INTO Admin (MaAdmin, MaTK, HoTen, QuyenHanQuanTri) VALUES
('AD01', 'TK_AD01', N'Nguyễn Văn Quản Trị', N'Toàn quyền hệ thống'),
('AD02', 'TK_AD02', N'Lê Thị Hệ Thống', N'Quản lý đào tạo');
GO

-- 3.3. Giảng Viên / Cố Vấn (10 bản ghi, phụ trách các lớp khác nhau)
INSERT INTO GiangVien (MaCoVan, MaTK, HoTen, ChuyenMon, LopPhuTrach) VALUES
('GV01', 'TK_GV01', N'TS. Lê Hoàng Nam', N'Công nghệ Phần mềm', 'CNTT2023'),
('GV02', 'TK_GV02', N'PGS.TS Trần Văn Minh', N'Khoa học Máy tính', 'KHMT2023'),
('GV03', 'TK_GV03', N'ThS. Phạm Thị Mai', N'Hệ thống Thông tin', 'HTTT2023'),
('GV04', 'TK_GV04', N'TS. Hoàng Quốc Việt', N'Kỹ thuật Phần mềm', 'KTPM2023'),
('GV05', 'TK_GV05', N'ThS. Đỗ Văn Hùng', N'An toàn Thông tin', 'ATTT2023'),
('GV06', 'TK_GV06', N'TS. Vũ Thị Lan', N'Trí tuệ Nhân tạo', 'AI2023'),
('GV07', 'TK_GV07', N'PGS.TS Ngô Văn Sỹ', N'Mạng máy tính', 'MMT2023'),
('GV08', 'TK_GV08', N'ThS. Bùi Thị Thanh', N'Khoa học Dữ liệu', 'KHDT2023'),
('GV09', 'TK_GV09', N'TS. Dương Trung Kiên', N'Thương mại Điện tử', 'TMĐT2023'),
('GV10', 'TK_GV10', N'ThS. Phan Đình Giót', N'Tin học Đọc lập', 'CNTT2022');
GO

-- 3.4. Chuyên ngành (10 bản ghi)
INSERT INTO ChuyenNganh (MaNganh, TenNganh, KhoaHoc) VALUES
('CNTT', N'Công nghệ Thông tin', 'K2023'),
('KHMT', N'Khoa học Máy tính', 'K2023'),
('HTTT', N'Hệ thống Thông tin', 'K2023'),
('KTPM', N'Kỹ thuật Phần mềm', 'K2023'),
('ATTT', N'An toàn Thông tin', 'K2023'),
('AI',   N'Trí tuệ Nhân tạo', 'K2023'),
('MMT',  N'Mạng máy tính và Truyền thông', 'K2023'),
('KHDT', N'Khoa học Dữ liệu', 'K2023'),
('TMĐT', N'Thương mại Điện tử', 'K2023'),
('CNTT2',N'Công nghệ Thông tin (Chất lượng cao)', 'K2022');
GO

-- 3.5. Sinh Viên (10 bản ghi thuộc các lớp và ngành khác nhau)
INSERT INTO SinhVien (MaSinhVien, MaTK, HoTen, Lop, MaNganh, MaCoVan, GPA_TichLuy, TongTinChiTichLuy) VALUES
('SV01', 'TK_SV01', N'Nguyễn Văn An', 'CNTT2023', 'CNTT', 'GV01', 3.20, 45),
('SV02', 'TK_SV02', N'Trần Thị Bích', 'CNTT2023', 'CNTT', 'GV01', 2.10, 24),
('SV03', 'TK_SV03', N'Lê Hoàng Long', 'KHMT2023', 'KHMT', 'GV02', 3.60, 48),
('SV04', 'TK_SV04', N'Phạm Thu Trang', 'HTTT2023', 'HTTT', 'GV03', 2.80, 35),
('SV05', 'TK_SV05', N'Đỗ Minh Quân', 'KTPM2023', 'KTPM', 'GV04', 3.15, 42),
('SV06', 'TK_SV06', N'Vũ Khánh Linh', 'ATTT2023', 'ATTT', 'GV05', 3.80, 50),
('SV07', 'TK_SV07', N'Bùi Gia Huy', 'AI2023', 'AI', 'GV06', 2.50, 30),
('SV08', 'TK_SV08', N'Ngô Thanh Hằng', 'MMT2023', 'MMT', 'GV07', 3.40, 40),
('SV09', 'TK_SV09', N'Dương Minh Tuấn', 'KHDT2023', 'KHDT', 'GV08', 3.00, 38),
('SV10', 'TK_SV10', N'Phan Ngọc Mai', 'CNTT2022', 'CNTT2', 'GV10', 3.25, 65);
GO

-- 3.6. Học phần (12 bản ghi thuộc nhiều ngành khác nhau)
INSERT INTO HocPhan (MaHocPhan, TenHocPhan, SoTinChi, PhanLoai, MaNganh, HocKyGoiY) VALUES
('INT1155', N'Nhập môn Lập trình', 3, 'BatBuoc', 'CNTT', 1),
('MAT1101', N'Toán rời rạc', 3, 'BatBuoc', 'CNTT', 1),
('INT1156', N'Cấu trúc dữ liệu và Giải thuật', 3, 'BatBuoc', 'CNTT', 2),
('INT1157', N'Lập trình hướng đối tượng', 3, 'BatBuoc', 'CNTT', 2),
('INT1158', N'Cơ sở dữ liệu', 3, 'BatBuoc', 'CNTT', 3),
('INT1159', N'Lập trình Web nâng cao', 3, 'TuChon', 'CNTT', 4),
('AI101',   N'Nhập môn Trí tuệ nhân tạo', 3, 'BatBuoc', 'AI', 2),
('KHMT101', N'Cấu trúc dữ liệu nâng cao', 3, 'BatBuoc', 'KHMT', 2),
('HTTT101', N'Phân tích thiết kế hệ thống', 3, 'BatBuoc', 'HTTT', 3),
('ATTT101', N'An toàn mạng máy tính', 3, 'BatBuoc', 'ATTT', 3),
('MMT101',  N'Mạng máy tính căn bản', 3, 'BatBuoc', 'MMT', 1),
('KHDT101', N'Phân tích dữ liệu lớn', 3, 'TuChon', 'KHDT', 4);
GO

-- 3.7. Ràng buộc học phần (10 bản ghi đủ các loại)
INSERT INTO RangBuocHocPhan (MaRB, MaHocPhan, MaHocPhanDieuKien, LoaiRangBuoc) VALUES
('RB01', 'INT1156', 'INT1155', 'TienQuyet'),
('RB02', 'INT1157', 'INT1155', 'HocTruoc'),
('RB03', 'INT1158', 'INT1156', 'SongHanh'),
('RB04', 'AI101', 'INT1155', 'TienQuyet'),
('RB05', 'KHMT101', 'INT1156', 'TienQuyet'),
('RB06', 'HTTT101', 'INT1158', 'HocTruoc'),
('RB07', 'ATTT101', 'MMT101', 'TienQuyet'),
('RB08', 'INT1159', 'INT1157', 'HocTruoc'),
('RB09', 'KHDT101', 'INT1158', 'SongHanh'),
('RB10', 'AI101', 'MAT1101', 'SongHanh');
GO

-- 3.8. Bảng điểm (12 bản ghi bao gồm cả đạt và rớt môn)
INSERT INTO BangDiem (MaBangDiem, MaSinhVien, MaHocPhan, DiemSo, TrangThaiDat, HocKyHoanThanh) VALUES
('BD01', 'SV01', 'INT1155', 8.50, 1, '20231'),
('BD02', 'SV01', 'MAT1101', 7.00, 1, '20231'),
('BD03', 'SV01', 'INT1156', 8.00, 1, '20232'),
('BD04', 'SV02', 'INT1155', 3.50, 0, '20231'), -- Rớt môn
('BD05', 'SV02', 'MAT1101', 6.00, 1, '20231'),
('BD06', 'SV03', 'INT1155', 9.00, 1, '20231'),
('BD07', 'SV03', 'KHMT101', 8.50, 1, '20232'),
('BD08', 'SV04', 'MMT101',  5.00, 1, '20231'),
('BD09', 'SV05', 'INT1155', 7.50, 1, '20231'),
('BD10', 'SV06', 'ATTT101', 9.20, 1, '20232'),
('BD11', 'SV07', 'AI101',   4.00, 0, '20232'), -- Rớt môn
('BD12', 'SV10', 'INT1158', 8.00, 1, '20222');
GO

-- 3.9. Kế hoạch học tập (10 bản ghi)
INSERT INTO KeHoachHocTap (MaSinhVien, HocKyMucTieu, TongSoTinChi, TrangThaiDuyet) VALUES
('SV01', '20242', 15, 'ChoDuyet'),
('SV02', '20242', 12, 'ChoDuyet'),
('SV03', '20242', 15, 'DaDuyet'),
('SV04', '20242', 14, 'BanThao'),
('SV05', '20242', 16, 'ChoDuyet'),
('SV06', '20242', 15, 'DaDuyet'),
('SV07', '20242', 12, 'YeuCauChinhSua'),
('SV08', '20242', 15, 'ChoDuyet'),
('SV09', '20242', 15, 'BanThao'),
('SV10', '20242', 18, 'DaDuyet');
GO

-- 3.10. Chi tiết kế hoạch (10 bản ghi)
INSERT INTO ChiTietKeHoach (MaCT, MaKeHoach, MaHocPhan, TrangThaiMon, LyDoGiaiThich) VALUES
('CT01', 1, 'INT1157', 'DeXuat', N'Đã hoàn thành môn điều kiện Nhập môn Lập trình.'),
('CT02', 1, 'INT1158', 'DeXuat', N'Đủ điều kiện học tập.'),
('CT03', 2, 'INT1156', 'Khoa', N'Bị khóa do sinh viên SV02 chưa đạt môn tiên quyết Nhập môn Lập trình.'),
('CT04', 3, 'KHMT101', 'DeXuat', N'Đạt điều kiện tiên quyết.'),
('CT05', 4, 'HTTT101', 'DeXuat', N'Đăng ký nguyện vọng cá nhân.'),
('CT06', 5, 'INT1159', 'DeXuat', N'Đủ điều kiện tín chỉ tích lũy.'),
('CT07', 6, 'ATTT101', 'DeXuat', N'Tiến độ học tập chuẩn xác.'),
('CT08', 7, 'AI101',    'Khoa', N'Bị khóa do rớt môn tiền quyết.'),
('CT09', 8, 'MMT101',   'DeXuat', N'Học phần tự chọn bổ sung.'),
('CT10', 10,'KHDT101',  'DeXuat', N'Sinh viên năm cuối hoàn thành chuyên ngành.');
GO

-- 3.11. Lịch sử mô phỏng What-if (10 bản ghi)
INSERT INTO LichSuMoPhong (MaSinhVien, TenKichBan, DuLieuGiaLap, GPA_DuKien) VALUES
('SV01', N'Giả lập cải thiện điểm INT1155 lên 9.5', '{"Mon":"INT1155","DiemDuKien":9.5}', 3.45),
('SV02', N'Giả lập học lại môn rớt INT1155', '{"Mon":"INT1155","HocLai":true}', 2.40),
('SV03', N'Giả lập đăng ký học vượt kỳ tới', '{"SoTinChi":21}', 3.75),
('SV04', N'Giả lập cải thiện môn MMT101', '{"Mon":"MMT101","DiemDuKien":8.0}', 2.95),
('SV05', N'Giả lập bảo lưu học kỳ 1 năm tài chính', '{"BaoLuu":true}', 3.15),
('SV06', N'Giả lập học song ngành Khoa học dữ liệu', '{"SongNhanh": "KHDT"}', 3.85),
('SV07', N'Giả lập học lại môn AI101', '{"Mon":"AI101","HocLai":true}', 2.70),
('SV08', N'Giả lập rút bớt 2 tín chỉ tự chọn', '{"RutMon": "MMT101"}', 3.40),
('SV09', N'Giả lập đăng ký thực tập doanh nghiệp sớm', '{"ThucTapSom": true}', 3.10),
('SV10', N'Giả lập làm đồ án tốt nghiệp sớm', '{"DoAnSom": true}', 3.35);
GO

-- 3.12. Phản hồi cố vấn (10 bản ghi)
INSERT INTO PhanHoiCoVan (MaKeHoach, MaCoVan, NoiDungGopY, TrangThaiPhanHoi) VALUES
(1, 'GV01', N'Kế hoạch học tập hợp lý, tiến độ tốt.', 'PheDuyet'),
(2, 'GV01', N'Cần đăng ký học lại môn Nhập môn Lập trình trước.', 'YeuCauChinhSua'),
(3, 'GV02', N'Kế hoạch xuất sắc, tiếp tục phát huy.', 'PheDuyet'),
(4, 'GV03', N'Cần bổ sung thêm các học phần tự chọn.', 'YeuCauChinhSua'),
(5, 'GV04', N'Khối lượng tín chỉ vừa phải, đồng ý.', 'PheDuyet'),
(6, 'GV05', N'Đạt yêu cầu chất lượng học tập cao.', 'PheDuyet'),
(7, 'GV06', N'Chưa đạt điều kiện tiên quyết môn AI.', 'YeuCauChinhSua'),
(8, 'GV07', N'Kế hoạch khả thi cho học kỳ tới.', 'PheDuyet'),
(9, 'GV08', N'Cần điều chỉnh lại thời khóa biểu.', 'YeuCauChinhSua'),
(10,'GV10', N'Hoàn toàn phù hợp với sinh viên năm cuối.', 'PheDuyet');
GO