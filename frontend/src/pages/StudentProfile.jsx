import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles.css';

const StudentProfile = () => {
    const { user, updateUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        enrollmentNo: '',
        phoneNumber: '',
        aadhaarCard: '',
        fullName: '',
        profilePhoto: ''
    });

    const [imagePreview, setImagePreview] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                enrollmentNo: user.enrollmentNo || '',
                phoneNumber: user.phoneNumber || '',
                aadhaarCard: user.aadhaarCard || '',
                fullName: user.fullName || '',
                profilePhoto: user.profilePhoto || ''
            });
            if (user.profilePhoto) {
                setImagePreview(user.profilePhoto);
            }
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setFormData({ ...formData, profilePhoto: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.enrollmentNo || !formData.phoneNumber || !formData.aadhaarCard ||
            !formData.fullName || !formData.profilePhoto) {
            toast.error('All fields are mandatory!');
            return;
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.put(
                'http://localhost:5000/api/users/profile',
                formData,
                config
            );

            // Update user context with new data
            updateUser(data);
            toast.success('Profile updated successfully!');
            navigate('/');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        }
    };

    return (
        <div className="container">
            <h2>Complete Your Profile</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
                All fields are mandatory for students
            </p>

            <form onSubmit={handleSubmit} className="card p-4">
                <div className="form-group">
                    <label>Full Name *</label>
                    <input
                        type="text"
                        className="form-control"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        placeholder="Enter your full name"
                    />
                </div>

                <div className="form-group">
                    <label>Enrollment Number *</label>
                    <input
                        type="text"
                        className="form-control"
                        name="enrollmentNo"
                        value={formData.enrollmentNo}
                        onChange={handleChange}
                        required
                        placeholder="e.g., 2024CS001"
                    />
                </div>

                <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                        type="tel"
                        className="form-control"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                        placeholder="10-digit mobile number"
                        pattern="[0-9]{10}"
                    />
                </div>

                <div className="form-group">
                    <label>Aadhaar Card Number *</label>
                    <input
                        type="text"
                        className="form-control"
                        name="aadhaarCard"
                        value={formData.aadhaarCard}
                        onChange={handleChange}
                        required
                        placeholder="12-digit Aadhaar number"
                        pattern="[0-9]{12}"
                    />
                </div>

                <div className="form-group">
                    <label>Profile Photo *</label>
                    <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleImageChange}
                        required={!formData.profilePhoto}
                    />
                    {imagePreview && (
                        <div style={{ marginTop: '10px' }}>
                            <img
                                src={imagePreview}
                                alt="Profile Preview"
                                style={{
                                    width: '150px',
                                    height: '150px',
                                    objectFit: 'cover',
                                    borderRadius: '50%',
                                    border: '3px solid #007bff'
                                }}
                            />
                        </div>
                    )}
                </div>

                <button type="submit" className="btn btn-primary">
                    Save Profile
                </button>
            </form>
        </div>
    );
};

export default StudentProfile;
