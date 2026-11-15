// frontend/src/page/Advisor/AdvisorDashboard.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../layout';

export default function AdvisorDashboard() {
    const [user, setUser] = useState(null);
    const editorRef = useRef(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
        }
        const savedNote = localStorage.getItem('advisor_rich_note');
        if (savedNote && editorRef.current) {
            editorRef.current.innerHTML = savedNote;
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    const handleInput = () => {
        if (editorRef.current) {
            localStorage.setItem('advisor_rich_note', editorRef.current.innerHTML);
        }
    };

    const executeCommand = (command, value = null) => {
        document.execCommand(command, false, value);
        handleInput();
        if (editorRef.current) editorRef.current.focus();
    };

    const handleKeyDown = (e) => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'b') {
                e.preventDefault();
                executeCommand('bold');
            } else if (e.key === 'i') {
                e.preventDefault();
                executeCommand('italic');
            } else if (e.key === 'u') {
                e.preventDefault();
                executeCommand('underline');
            }
        }
    };

    return (
        <Layout user={user} onLogout={handleLogout}>
            <div className="advisor-container" style={{ maxWidth: '950px', margin: '0 auto', padding: '20px' }}>
                {/* 2 nút điều hướng chính */}
                <div className="nav-sub-links" style={{ marginBottom: '25px', display: 'flex', gap: '15px' }}>
                    <Link to="/advisor/students" className="btn-nav-link" style={{ padding: '12px 24px', background: '#2b579a', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        👥 Xem Danh Sách Sinh Viên
                    </Link>
                    <Link to="/advisor/student-plans" className="btn-nav-link" style={{ padding: '12px 24px', background: '#107c41', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        📋 Xem Kế Hoạch Của Sinh Viên
                    </Link>
                </div>

                {/* Khung soạn thảo chuẩn Microsoft Word */}
                <div className="word-editor-container" style={{ background: '#f3f3f3', border: '1px solid #d1d1d1', borderRadius: '6px', boxShadow: '0 4px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    {/* Thanh công cụ Ribbon có chọn Font chữ & Cỡ chữ */}
                    <div className="word-ribbon" style={{ background: '#2b579a', color: 'white', padding: '8px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>📄 Ghi chú nhắc việc nhanh (Phong cách Word)</span>
                        <div className="ribbon-tools" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {/* Chọn Kiểu chữ (Font Family) */}
                            <select 
                                onChange={(e) => executeCommand('fontName', e.target.value)} 
                                defaultValue="Calibri"
                                style={{ padding: '4px 6px', borderRadius: '3px', border: 'none', background: 'white', color: '#333', cursor: 'pointer' }}
                                title="Chọn font chữ"
                            >
                                <option value="Calibri">Calibri</option>
                                <option value="Arial">Arial</option>
                                <option value="Times New Roman">Times New Roman</option>
                                <option value="Courier New">Courier New</option>
                                <option value="Georgia">Georgia</option>
                            </select>

                            {/* Chọn Cỡ chữ (Font Size) */}
                            <select 
                                onChange={(e) => executeCommand('fontSize', e.target.value)} 
                                defaultValue="3"
                                style={{ padding: '4px 6px', borderRadius: '3px', border: 'none', background: 'white', color: '#333', cursor: 'pointer' }}
                                title="Chọn cỡ chữ"
                            >
                                <option value="1">Nhỏ (10px)</option>
                                <option value="2">Bình thường (12px)</option>
                                <option value="3">Trung bình (14px)</option>
                                <option value="4">Lớn (18px)</option>
                                <option value="5">Rất lớn (24px)</option>
                                <option value="6">Cực lớn (32px)</option>
                            </select>

                            <span style={{ borderLeft: '1px solid #4a75b5', height: '20px', margin: '0 2px' }}></span>

                            <button type="button" onClick={() => executeCommand('bold')} style={{ background: '#1f3e70', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }} title="In đậm (Ctrl+B)">B</button>
                            <button type="button" onClick={() => executeCommand('italic')} style={{ background: '#1f3e70', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer', fontStyle: 'italic' }} title="In nghiêng (Ctrl+I)">I</button>
                            <button type="button" onClick={() => executeCommand('underline')} style={{ background: '#1f3e70', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer', textDecoration: 'underline' }} title="Gạch chân (Ctrl+U)">U</button>
                        </div>
                    </div>

                    {/* Vùng giấy viết */}
                    <div style={{ padding: '20px', background: '#fafafa' }}>
                        <div 
                            ref={editorRef}
                            contentEditable="true"
                            onInput={handleInput}
                            onKeyDown={handleKeyDown}
                            style={{
                                width: '100%',
                                minHeight: '320px',
                                background: 'white',
                                padding: '30px',
                                border: '1px solid #ccc',
                                boxShadow: '0 0 10px rgba(0,0,0,0.05)',
                                outline: 'none',
                                fontSize: '1rem',
                                fontFamily: 'Calibri, Arial, sans-serif',
                                lineHeight: '1.6',
                                overflowY: 'auto'
                            }}
                        />
                    </div>
                </div>
            </div>
        </Layout>
    );
}