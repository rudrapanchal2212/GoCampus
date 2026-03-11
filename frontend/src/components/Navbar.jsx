import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';
import '../styles.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { isDark, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();

    const onLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/"><h1>GoCampus</h1></Link>
            </div>
            <ul className="navbar-links">
                {user ? (
                    <>
                        <li><span style={{ color: '#666', marginRight: '10px' }}>Welcome, {user.name}</span></li>
                        <li><Link to="/dashboard">Dashboard</Link></li>
                        <li><Link to="/events">Events</Link></li>

                        {user.role === 'student' && (
                            <li><Link to="/profile">My Profile</Link></li>
                        )}

                        {user.role === 'admin' && (
                            <>
                                <li><Link to="/add-event">Add Event</Link></li>
                                <li><Link to="/students">Students</Link></li>
                                <li><Link to="/attendance">Attendance</Link></li>
                                <li><Link to="/registrations">Registrations</Link></li>
                            </>
                        )}

                        <li>
                            <button
                                onClick={toggleTheme}
                                className="theme-toggle"
                                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                {isDark ? '☀️' : '🌙'}
                            </button>
                        </li>

                        <li>
                            <button onClick={onLogout} className="btn btn-danger" style={{ padding: '5px 10px', fontSize: '0.9rem' }}>
                                Logout
                            </button>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <button
                                onClick={toggleTheme}
                                className="theme-toggle"
                                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                {isDark ? '☀️' : '🌙'}
                            </button>
                        </li>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/signup">Sign Up</Link></li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
