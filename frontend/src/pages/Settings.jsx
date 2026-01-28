import React from 'react';
import { Flame, Bell } from 'lucide-react';
import '../Dashboard.css';

const Settings = () => {
    return (
        <div>
            <header className="content-header">
                <div className="greeting">
                    <h2>Settings</h2>
                    <p>Manage your preferences.</p>
                </div>
                <div className="header-stats">
                    <div className="stat-pill streak">
                        <Flame size={18} fill="currentColor" /> 5 Day Streak
                    </div>
                    <button className="notif-btn"><Bell size={20} /></button>
                    <div className="profile-avatar">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun" alt="User" />
                    </div>
                </div>
            </header>
            <div className="dashboard-grid">
                <h2>Settings Content Goes Here</h2>
            </div>
        </div>
    );
};

export default Settings;
