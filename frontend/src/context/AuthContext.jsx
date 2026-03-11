import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // Login
    const login = async (userData) => {
        try {
            const res = await axios.post('http://localhost:5000/api/users/login', userData);
            if (res.data) {
                localStorage.setItem('user', JSON.stringify(res.data));
                setUser(res.data);
                toast.success('Logged in successfully!');
                return true;
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Login failed');
            return false;
        }
    };

    // Register
    const register = async (userData) => {
        try {
            const res = await axios.post('http://localhost:5000/api/users', userData);
            if (res.data) {
                localStorage.setItem('user', JSON.stringify(res.data));
                setUser(res.data);
                toast.success('Registered successfully!');
                return true;
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Registration failed');
            return false;
        }
    };

    // Update user data (for profile updates)
    const updateUser = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    // Google Login
    const googleLogin = async (credential) => {
        try {
            const res = await axios.post('http://localhost:5000/api/users/google-login', { credential });
            if (res.data) {
                localStorage.setItem('user', JSON.stringify(res.data));
                setUser(res.data);
                toast.success('Logged in with Google successfully!');
                return true;
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Google login failed');
            return false;
        }
    };

    // Logout
    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
        toast.info('Logged out');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, googleLogin, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
