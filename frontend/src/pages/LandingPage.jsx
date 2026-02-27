import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const [word, setWord] = useState(0);
    const words = ['ADHD', 'DYSLEXIA', 'AUTISM', 'YOU'];

    useEffect(() => {
        const t = localStorage.getItem('token');
        if (t) navigate('/dashboard');
        const iv = setInterval(() => setWord(w => (w + 1) % words.length), 2400);
        return () => clearInterval(iv);
    }, [navigate]);

    return (
        <div className="zn-root">

            {/* ── paper texture grain ── */}
            <div className="zn-grain" aria-hidden="true" />

            {/* ══ NAV ══ */}
            <nav className="zn-nav">
                <div className="zn-nav-logo">
                    <img src={logo} alt="LinguaAble mascot" className="zn-logo-img" />
                    <div className="zn-logo-text">
                        Lingua<span>Able</span>
                    </div>
                </div>
                <div className="zn-nav-links">
                    <button className="zn-link-btn" onClick={() => navigate('/login')}>
                        sign in
                    </button>
                    <button className="zn-stamp-btn" onClick={() => navigate('/signup')}>
                        START FREE
                    </button>
                </div>
            </nav>

            {/* ══ HERO ══ */}
            <section className="zn-hero">

                {/* top-left scrap — rotated label */}
                <div className="zn-scrap zn-scrap-tl" aria-hidden="true">
                    <span>नमस्ते</span>
                </div>

                {/* tape strip */}
                <div className="zn-tape zn-tape-1" aria-hidden="true" />

                {/* Main headline block */}
                <div className="zn-hero-center">

                    {/* tiny label above */}
                    <p className="zn-eyebrow">— a language app built for</p>

                    {/* giant torn headline */}
                    <h1 className="zn-h1">
                        <span className="zn-h1-learn">Learn</span>
                        <span className="zn-h1-hindi">
                            <span className="zn-h1-deva">हिन्दी</span>
                            <svg className="zn-underline-svg" viewBox="0 0 300 14" aria-hidden="true">
                                <path d="M4,10 C40,2 90,14 140,8 C190,2 240,13 296,7" stroke="#E8462A" strokeWidth="4" fill="none" strokeLinecap="round"/>
                            </svg>
                        </span>
                        <span className="zn-h1-if">if your brain is</span>
                        <span className="zn-h1-swap-wrap">
                            <span className="zn-h1-swap" key={word}>{words[word]}</span>
                            <span className="zn-marker-box" aria-hidden="true" />
                        </span>
                    </h1>

                    <p className="zn-hero-body">
                        Short bursts. Voice practice. Real Hindi. Zero overwhelm.
                        <br />Designed from scratch for neurodiverse minds.
                    </p>

                    <div className="zn-hero-btns">
                        <button className="zn-btn-main" onClick={() => navigate('/signup')}>
                            I want to try it →
                        </button>
                        <button className="zn-btn-ghost" onClick={() => navigate('/login')}>
                            already learning
                        </button>
                    </div>
                </div>

                {/* Right — mascot on torn paper */}
                <div className="zn-hero-right">
                    <div className="zn-tape zn-tape-2" aria-hidden="true" />
                    <div className="zn-photo-scrap">
                        <img src={logo} alt="LinguaAble zebra mascot" className="zn-mascot" />
                        <div className="zn-caption">our zebra mascot 🦓</div>
                    </div>
                    {/* sticky note */}
                    <div className="zn-sticky-note">
                        <p>45s lessons</p>
                        <p>zero pressure</p>
                        <p className="zn-sticky-emoji">💛</p>
                    </div>
                </div>

                {/* Stats row — cut-out style */}
                <div className="zn-stats-row">
                    {[
                        { n: '45s', t: 'per lesson chunk' },
                        { n: '3×', t: 'better retention' },
                        { n: '12+', t: 'accessibility modes' },
                    ].map((s, i) => (
                        <div className="zn-stat-block" key={i}>
                            <span className="zn-stat-n">{s.n}</span>
                            <span className="zn-stat-t">{s.t}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── torn paper divider ── */}
            <div className="zn-tear zn-tear-1" aria-hidden="true" />

            {/* ══ FEATURES ══ */}
            <section className="zn-features">
                <div className="zn-features-header">
                    <div className="zn-section-tag">what's inside</div>
                    <h2 className="zn-features-h2">
                        built around<br />
                        <em>your brain.</em>
                    </h2>
                </div>

                <div className="zn-feat-grid">
                    {[
                        { icon: '🧠', title: 'ADHD-First', body: 'One idea per screen. 45-second bursts. No walls of text. Ever.', tape: '#F5C842', rot: '-1.5deg', offset: '0px' },
                        { icon: '📖', title: 'Dyslexia Mode', body: 'OpenDyslexic font, colour overlays, line spacing — one toggle.', tape: '#4ABFFF', rot: '1deg', offset: '8px' },
                        { icon: '🎤', title: 'Voice AI', body: 'Speak Hindi out loud. Real-time NLP scores your pronunciation.', tape: '#FF8A65', rot: '-0.5deg', offset: '4px' },
                        { icon: '🎯', title: 'Adaptive Pace', body: 'Engine watches how you do. Slows down or speeds up. Auto.', tape: '#A5D6A7', rot: '1.5deg', offset: '0px' },
                        { icon: '🏆', title: 'Streak XP', body: 'Badges, fire streaks, leaderboard. Rewards that actually land.', tape: '#CE93D8', rot: '-1deg', offset: '6px' },
                        { icon: '🇮🇳', title: 'India-Built', body: 'Authentic Hindi audio, Devanagari script, real cultural context.', tape: '#F5C842', rot: '0.8deg', offset: '2px' },
                    ].map((f, i) => (
                        <div key={i} className="zn-feat-card" style={{ '--tape-c': f.tape, '--rot': f.rot, '--offset': f.offset }}>
                            <div className="zn-feat-tape" aria-hidden="true" />
                            <div className="zn-feat-icon">{f.icon}</div>
                            <h3 className="zn-feat-title">{f.title}</h3>
                            <p className="zn-feat-body">{f.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── torn divider 2 ── */}
            <div className="zn-tear zn-tear-2" aria-hidden="true" />

            {/* ══ HOW IT WORKS ══ */}
            <section className="zn-how">
                <div className="zn-how-label">how it works</div>
                <h2 className="zn-how-h2">three steps.<br /><span>that's all.</span></h2>

                <div className="zn-steps">
                    {[
                        { n: '1.', title: 'tell us how you learn', body: 'Pick your style — visual, audio, read/write, kinesthetic. We profile you.', col: '#E8462A' },
                        { n: '2.', title: 'do a tiny lesson', body: 'Audio. Image. Speak. Type. Five minutes max. Stop whenever.', col: '#F5A623' },
                        { n: '3.', title: 'watch it stick', body: "Spaced repetition makes sure you remember it next week and next month.", col: '#27AE60' },
                    ].map((s, i) => (
                        <div key={i} className="zn-step">
                            <span className="zn-step-n" style={{ color: s.col }}>{s.n}</span>
                            <div className="zn-step-rule" style={{ background: s.col }} />
                            <h3 className="zn-step-title">{s.title}</h3>
                            <p className="zn-step-body">{s.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── torn divider 3 ── */}
            <div className="zn-tear zn-tear-3" aria-hidden="true" />

            {/* ══ FINAL CTA ══ */}
            <section className="zn-final">
                <div className="zn-tape zn-tape-final" aria-hidden="true" />
                <div className="zn-final-inner">
                    <div className="zn-final-left">
                        <p className="zn-final-kicker">no card. no pressure.</p>
                        <h2 className="zn-final-h2">
                            your first<br />
                            Hindi word<br />
                            <span className="zn-final-free">is free.</span>
                        </h2>
                        <div className="zn-final-btns">
                            <button className="zn-btn-main zn-btn-lg" onClick={() => navigate('/signup')}>
                                create account →
                            </button>
                            <button className="zn-btn-ghost zn-btn-ghost-inv" onClick={() => navigate('/login')}>
                                sign in
                            </button>
                        </div>
                    </div>
                    <div className="zn-final-right" aria-hidden="true">
                        <div className="zn-hindi-poster">
                            <span className="zn-poster-deva">नमस्ते</span>
                            <span className="zn-poster-en">hello in hindi</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ FOOTER ══ */}
            <footer className="zn-footer">
                <div className="zn-footer-brand">
                    <img src={logo} alt="" className="zn-footer-img" />
                    <span>LinguaAble</span>
                </div>
                <p className="zn-footer-copy">made with 💛 for neurodiverse learners · {new Date().getFullYear()}</p>
            </footer>

        </div>
    );
};

export default LandingPage;