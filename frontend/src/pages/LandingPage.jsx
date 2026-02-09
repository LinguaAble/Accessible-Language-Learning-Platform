import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animations on mount
        setIsVisible(true);

        // Check if user is already logged in
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const features = [
        {
            icon: '🧠',
            title: 'Dyslexia-Friendly Design',
            description: 'Clear fonts, high contrast, and customizable text spacing for easier reading'
        },
        {
            icon: '⏱️',
            title: 'ADHD-Optimized Learning',
            description: 'Short, focused lessons with frequent breaks and engaging interactions'
        },
        {
            icon: '🎤',
            title: 'Interactive Speech Practice',
            description: 'Practice Hindi pronunciation with real-time feedback and voice recognition'
        },
        {
            icon: '📖',
            title: 'Multi-Sensory Approach',
            description: 'Visual, auditory, and kinesthetic learning methods combined for better retention'
        },
        {
            icon: '🎯',
            title: 'Adaptive Difficulty',
            description: 'Lessons automatically adjust to your learning pace and comprehension level'
        },
        {
            icon: '🏆',
            title: 'Motivational Rewards',
            description: 'Positive reinforcement with achievements, streaks, and progress celebrations'
        }
    ];

    return (
        <div className="landing-page">
            <div className="landing-container">
                {/* Left Side - Hero Content */}
                <div className="hero-side">
                    <div className="hero-content">
                        <div className="logo-wrapper">
                            <img src={logo} alt="LinguaAble Mascot" className="landing-logo" />
                        </div>

                        <h1 className="hero-title">
                            <span className="text-brand-blue">Lingua</span>
                            <span className="text-brand-red">Able</span>
                        </h1>

                        <p className="hero-tagline">Built Around Learners, Not Limitations!</p>

                        <p className="hero-description">
                            Master Hindi with confidence! LinguaAble is specially designed for learners with dyslexia,
                            ADHD, and other learning disabilities. Our accessible, multi-sensory approach makes
                            learning Hindi engaging, effective, and stress-free.
                        </p>

                        <div className="cta-buttons">
                            <button
                                className="cta-btn primary-btn"
                                onClick={() => navigate('/login')}
                            >
                                Sign In
                            </button>
                            <button
                                className="cta-btn secondary-btn"
                                onClick={() => navigate('/signup')}
                            >
                                Create Account
                            </button>
                        </div>
                    </div>

                    {/* Animated Background Elements */}
                    <div className="floating-shapes">
                        <div className="shape shape-1"></div>
                        <div className="shape shape-2"></div>
                        <div className="shape shape-3"></div>
                    </div>
                </div>

                {/* Right Side - Features Grid */}
                <div className="features-side">
                    <h2 className="features-title">Learning Hindi Made Accessible</h2>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="feature-card"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="feature-icon">{feature.icon}</div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
