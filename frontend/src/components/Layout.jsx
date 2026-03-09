import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ChatBot from './ChatBot';
import AccessibilityWidget from './AccessibilityWidget';
import '../Dashboard.css'; // Ensure styling is applied to container and sidebar

const Layout = () => {
    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="content-wrapper" style={{ flex: 1, display: 'flex', position: 'relative', height: '100vh', overflow: 'hidden' }}>
                <main className="main-content">
                    <Outlet />
                </main>
                
                {/* Floating Widgets Container (Fixed relative to the content area, clear of the sidebar, won't scroll) */}
                <div style={{ position: 'absolute', bottom: '24px', right: '32px', display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 1000, pointerEvents: 'none' }}>
                    <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', position: 'relative' }}>
                        <AccessibilityWidget />
                    </div>
                    <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', position: 'relative' }}>
                        <ChatBot />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Layout;
