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
            description: 'Clear fonts, high contrast, and customizable text spacing'
        },
        {
            icon: '⏱️',
            title: 'ADHD-Optimized Learning',
            description: 'Short, focused lessons with frequent breaks'
        },
        {
            icon: '🎤',
            title: 'Interactive Speech Practice',
            description: 'Real-time pronunciation feedback and voice recognition'
        },
        {
            icon: '📖',
            title: 'Multi-Sensory Approach',
            description: 'Visual, auditory, and kinesthetic learning methods'
        },
        {
            icon: '🎯',
            title: 'Adaptive Difficulty',
            description: 'Lessons adjust to your learning pace automatically'
        },
        {
            icon: '🏆',
            title: 'Motivational Rewards',
            description: 'Achievements, streaks, and progress celebrations'
        }
    ];

    return (
        <div className="landing-page">

            <div className="landing-container">
                {/* Hero Section */}
                <div className="hero-section">
                    <div className="logo-wrapper">
                        <img src={logo} alt="LinguaAble Mascot" className="landing-logo" />
                    </div>

                    <h1 className="hero-title">
                        <span className="text-brand-blue">Lingua</span>
                        <span className="text-brand-red">Able</span>
                    </h1>

                    <p className="hero-tagline">Built Around Learners, Not Limitations!</p>

                    <p className="hero-description">
                        Master Hindi with confidence! Specially designed for learners with dyslexia,
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

                {/* Features Section */}
                <div className="features-section">
                    <h2 className="features-title">Why Choose LinguaAble?</h2>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className={`feature-card ${isVisible ? 'visible' : ''}`}
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
