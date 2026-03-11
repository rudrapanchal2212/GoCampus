// frontend/src/pages/LandingPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Simple scroll animation observer
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <div className="landing-page">
            <nav className="landing-nav glass-panel">
                <div className="landing-logo">
                    {/* New Custom SVG Logo */}
                    <svg width="180" height="40" viewBox="0 0 180 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="logoGradient" x1="0" y1="0" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                        </defs>
                        {/* Icon: Styled G with a spark/event center */}
                        <path d="M20 5C11.7157 5 5 11.7157 5 20C5 28.2843 11.7157 35 20 35C26.5 35 31.5 31 33.5 25H22V19H39.5C39.8 21 40 23 40 25C40 34 32 40 20 40C8.9543 40 0 31.0457 0 20C0 8.9543 8.9543 0 20 0C25.5 0 30.5 2 34.5 5.5L29 11C27 9 24 7.5 20 7.5Z" fill="url(#logoGradient)" />
                        <circle cx="28" cy="12" r="3" fill="#ec4899" />

                        {/* Text: GoCampus with modern font style embedded */}
                        <text x="50" y="28" fontFamily="'Outfit', sans-serif" fontWeight="800" fontSize="24" fill="white" letterSpacing="-0.5">
                            Go<tspan fill="url(#logoGradient)">Campus</tspan>
                        </text>
                    </svg>
                </div>
                <ul className="landing-nav-links">
                    <li><a href="#about">About</a></li>
                    <li><a href="#features">Features</a></li>
                    <li><a href="#how-it-works">How It Works</a></li>
                    <li><a href="#gallery">Gallery</a></li>
                </ul>
                <div className="landing-auth-links">
                    <button
                        onClick={() => navigate('/login')}
                        className="btn-outline btn-login"
                    >
                        Login / Sign Up
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="landing-hero">
                <div className="hero-content">
                    <div className="hero-tagline">Smart Campus Event Management Platform</div>
                    <h1 className="hero-title">
                        Experience Campus Life <span className="highlight-orange">Like Never Before</span>
                    </h1>
                    <p className="hero-desc">
                        Discover, organize, and participate in the most exciting events at your university.
                        GoCampus bridges the gap between students and vibrant campus culture.
                    </p>
                    <div className="hero-buttons">
                        <button className="btn-primary-glow" onClick={() => navigate('/signup')}>
                            Get Started Now
                        </button>
                        <button className="btn-secondary-glow" onClick={() => document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' })}>
                            See Events
                        </button>
                    </div>
                </div>
                <div className="hero-image-container animate-on-scroll fade-in-right">
                    <div className="hero-blob"></div>
                    <img
                        src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                        alt="Students celebrating"
                        className="hero-img mirrored"
                    />
                </div>
            </div>

            {/* Stats Section */}
            <section className="stats-section glass-panel animate-on-scroll fade-in-up">
                <div className="container stats-grid">
                    <div className="stat-item">
                        <div className="stat-number">50+</div>
                        <div className="stat-label">Active Events</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">2000+</div>
                        <div className="stat-label">Students Registered</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">15+</div>
                        <div className="stat-label">College Societies</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">100%</div>
                        <div className="stat-label">Paperless</div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="landing-section">
                <div className="container split-layout">
                    <div className="split-image animate-on-scroll fade-in-left">
                        <img
                            src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                            alt="Collaboration"
                            className="rounded-image"
                        />
                    </div>
                    <div className="split-content animate-on-scroll fade-in-right">
                        <h2>Why GoCampus?</h2>
                        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#ccc' }}>
                            GoCampus isn't just a management tool; it's a community builder. We streamlined the complex
                            process of event approvals, registrations, and feedback into one intuitive platform.
                        </p>
                        <ul className="check-list">
                            <li>Eliminate paperwork and long queues.</li>
                            <li>Real-time notifications for event updates.</li>
                            <li>Secure QR code based attendance.</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="landing-section alt-bg">
                <div className="container">
                    <h2 className="section-title text-center">Powerful Features</h2>
                    <p className="text-center section-subtitle">Everything you need to manage campus events efficiently.</p>

                    <div className="features-grid">
                        <div className="feature-card glass-panel animate-on-scroll fade-in-up">
                            <div className="feature-icon">📅</div>
                            <h3>Event Management</h3>
                            <p>Create and edit events with rich details, images, and schedules.</p>
                        </div>
                        <div className="feature-card glass-panel animate-on-scroll fade-in-up delay-100">
                            <div className="feature-icon">🎫</div>
                            <h3>Instant Registration</h3>
                            <p>One-click registration for students with instant confirmation.</p>
                        </div>
                        <div className="feature-card glass-panel animate-on-scroll fade-in-up delay-200">
                            <div className="feature-icon">📱</div>
                            <h3>Digital Attendance</h3>
                            <p>Mark attendance quickly using digital tools, no spreadsheets needed.</p>
                        </div>
                        <div className="feature-card glass-panel animate-on-scroll fade-in-up">
                            <div className="feature-icon">📊</div>
                            <h3>Admin Insights</h3>
                            <p>Visual analytics for participation trends and event success rates.</p>
                        </div>
                        <div className="feature-card glass-panel animate-on-scroll fade-in-up delay-100">
                            <div className="feature-icon">🔔</div>
                            <h3>Live Updates</h3>
                            <p>Push notifications ensure no one misses out on venue changes.</p>
                        </div>
                        <div className="feature-card glass-panel animate-on-scroll fade-in-up delay-200">
                            <div className="feature-icon">🔒</div>
                            <h3>Secure Data</h3>
                            <p>Role-based access control keeps student data safe and private.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery / Recent Events */}
            <section id="gallery" className="landing-section">
                <div className="container">
                    <h2 className="section-title text-center">Recent Highlights</h2>
                    <div className="gallery-grid">
                        <div className="gallery-item animate-on-scroll zoom-in">
                            <img src="https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&w=400&q=80" alt="Event 1" />
                            <div className="overlay"><h4>Tech Symposium</h4></div>
                        </div>
                        <div className="gallery-item animate-on-scroll zoom-in delay-100">
                            <img src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=400&q=80" alt="Event 2" />
                            <div className="overlay"><h4>Cultural Fest</h4></div>
                        </div>
                        <div className="gallery-item animate-on-scroll zoom-in delay-200">
                            <img src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=400&q=80" alt="Event 3" />
                            <div className="overlay"><h4>Hackathon 2024</h4></div>
                        </div>
                        <div className="gallery-item animate-on-scroll zoom-in delay-300">
                            <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Event 4" />
                            <div className="overlay"><h4>Guest Lecture</h4></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="landing-section alt-bg">
                <div className="container">
                    <h2 className="section-title text-center">What Students Say</h2>
                    <div className="testimonials-grid">
                        <div className="testimonial-card glass-panel animate-on-scroll fade-in-up">
                            <p>"GoCampus made registering for the annual fest so easy. No more long lines at the auditoriums!"</p>
                            <div className="user-profile">
                                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80" alt="User 1" />
                                <div>
                                    <h5>Alex Johnson</h5>
                                    <span>CS Dept</span>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-card glass-panel animate-on-scroll fade-in-up delay-100">
                            <p>"As a club lead, tracking attendance used to be a nightmare. GoCampus fixed that instantly."</p>
                            <div className="user-profile">
                                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="User 2" />
                                <div>
                                    <h5>Sarah Williams</h5>
                                    <span>Art Society</span>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-card glass-panel animate-on-scroll fade-in-up delay-200">
                            <p>"The interface is super clean and the dark mode looks amazing. Love using this app."</p>
                            <div className="user-profile">
                                <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80" alt="User 3" />
                                <div>
                                    <h5>Michael Chen</h5>
                                    <span>MBA</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="landing-section cta-section">
                <div className="container text-center animate-on-scroll zoom-in">
                    <h2>Ready to Transform Campus Events?</h2>
                    <p style={{ maxWidth: '600px', margin: '1rem auto', color: '#e0e0e0' }}>
                        Join thousands of students and faculty members using GoCampus today.
                    </p>
                    <button className="btn-primary-glow large" onClick={() => navigate('/signup')}>
                        Launch Application
                    </button>
                </div>
            </section>

            {/* Footer Section */}
            <footer className="landing-footer">
                <div className="container footer-grid">
                    <div className="footer-col">
                        <h3>GoCampus</h3>
                        <p>Empowering academic institutions with next-gen event technology.</p>
                    </div>
                    <div className="footer-col">
                        <h4>Links</h4>
                        <ul>
                            <li><a href="#about">About Us</a></li>
                            <li><a href="#events">Events</a></li>
                            <li><a href="/login">Login</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Contact</h4>
                        <ul>
                            <li>support@gocampus.edu</li>
                            <li>+91 98765 43210</li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Social</h4>
                        <div className="social-links-footer">
                            <span>🐦</span>
                            <span>📸</span>
                            <span>💼</span>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© 2026 GoCampus. All Rights Reserved.</p>
                </div>
            </footer>

            {/* Scroll to Top Button */}
            <button
                className={`scroll-to-top ${showScrollTop ? 'visible' : ''}`}
                onClick={scrollToTop}
                aria-label="Scroll to top"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 15l-6-6-6 6" />
                </svg>
            </button>
        </div>
    );
};

export default LandingPage;
