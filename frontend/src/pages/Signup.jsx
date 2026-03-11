import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx';
import '../styles.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        department: ''
    });

    const { name, email, password, department } = formData;
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        const userData = {
            name,
            email,
            password,
            department
        };

        const success = await register(userData);
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
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="8.5" cy="7" r="4"></circle>
                            <line x1="20" y1="8" x2="20" y2="14"></line>
                            <line x1="23" y1="11" x2="17" y2="11"></line>
                        </svg>
                    </div>
                    <h2 className="login-title">Create Account</h2>
                    <p className="login-subtitle">Join the GoCampus community today</p>
                </div>

                <form onSubmit={onSubmit}>
                    <div className="input-group">
                        <input
                            type="text"
                            className="login-input"
                            id="name"
                            name="name"
                            value={name}
                            placeholder="Full Name"
                            onChange={onChange}
                            required
                        />
                        <div className="input-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </div>
                    </div>

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

                    <div className="input-group">
                        <input
                            type="text"
                            className="login-input"
                            id="department"
                            name="department"
                            value={department}
                            placeholder="Department (e.g. CS, IT)"
                            onChange={onChange}
                        />
                        <div className="input-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 21h18" />
                                <path d="M5 21V7l8-4 8 4v14" />
                                <path d="M17 21v-8.5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0-.5.5V21" />
                                <path d="M14 21v-8" />
                            </svg>
                        </div>
                    </div>

                    <button type="submit" className="login-btn">
                        Create Account
                    </button>

                    <div className="login-footer">
                        Already have an account? <Link to="/login">Sign in</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;
