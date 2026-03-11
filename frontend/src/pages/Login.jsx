import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx';
import '../styles.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const { email, password } = formData;
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        const userData = { email, password };
        const success = await login(userData);

        if (success) {
            navigate('/');
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                            <path d="M6 12v5c3 3 9 3 12 0v-5" />
                        </svg>
                    </div>
                    <h2 className="login-title">Welcome Back</h2>
                    <p className="login-subtitle">Sign in to continue to GoCampus</p>
                </div>

                <form onSubmit={onSubmit}>
                    <div className="input-group">
                        <input
                            type="email"
                            className="login-input"
                            id="email"
                            name="email"
                            value={email}
                            placeholder="Email Address"
                            onChange={onChange}
                            required
                        />
                        <div className="input-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                        </div>
                    </div>

                    <div className="input-group">
                        <input
                            type="password"
                            className="login-input"
                            id="password"
                            name="password"
                            value={password}
                            placeholder="Password"
                            onChange={onChange}
                            required
                        />
                        <div className="input-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </div>
                    </div>

                    <div className="login-options">
                        <label className="remember-me">
                            <input type="checkbox" /> Remember me
                        </label>
                        <a href="#" className="forgot-password">Forgot Password?</a>
                    </div>

                    <button type="submit" className="login-btn">
                        Sign In
                    </button>

                    <div className="login-footer">
                        Don't have an account? <Link to="/signup">Sign up</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
