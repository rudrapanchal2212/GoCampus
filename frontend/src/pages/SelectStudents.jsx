import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles.css';

const SelectStudents = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get initial state passed from Attendance.jsx
    const initialState = location.state || {};
    const [selectedStudents, setSelectedStudents] = useState(initialState.selectedStudents || []);
    const eventName = initialState.eventName || '--';
    const sessionName = initialState.session || '--';

    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudents();
        // Scroll to top on load since this acts as a page transition
        window.scrollTo(0, 0);
    }, []);

    const fetchStudents = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get(`http://${window.location.hostname}:5000/api/users/students`, config);
            setStudents(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching students:", error);
            toast.error("Failed to load students");
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredStudents = students.filter(student => {
        const str = searchTerm.toLowerCase();
        const matchingName = student.name && student.name.toLowerCase().includes(str);
        const matchingEnrollment = student.enrollmentNo && student.enrollmentNo.toLowerCase().includes(str);
        const matchingEmail = student.email && student.email.toLowerCase().includes(str);
        return matchingName || matchingEnrollment || matchingEmail;
    });

    const isAllSelected = filteredStudents.length > 0 && 
        filteredStudents.every(student => selectedStudents.includes(student._id));

    const handleSelectAll = () => {
        if (isAllSelected) {
            // Deselect all filtered
            const filteredIds = filteredStudents.map(s => s._id);
            setSelectedStudents(selectedStudents.filter(id => !filteredIds.includes(id)));
        } else {
            // Select all filtered
            const newSelections = [...selectedStudents];
            filteredStudents.forEach(student => {
                if (!newSelections.includes(student._id)) {
                    newSelections.push(student._id);
                }
            });
            setSelectedStudents(newSelections);
        }
    };

    const toggleStudent = (id) => {
        if (selectedStudents.includes(id)) {
            setSelectedStudents(selectedStudents.filter(studentId => studentId !== id));
        } else {
            setSelectedStudents([...selectedStudents, id]);
        }
    };

    const handleSubmit = () => {
        // Navigate back to attendance page with state
        navigate('/attendance', {
            state: {
                ...initialState,
                selectedStudents
            }
        });
    };

    const handleCancel = () => {
        navigate('/attendance', {
            state: initialState // pass original state back without new selections
        });
    };

    return (
        <div className="container" style={{ paddingBottom: '100px', animation: 'fadeIn 0.3s ease' }}>
            <div className="card p-4 mb-4" style={{ backgroundColor: 'var(--card-bg)', borderLeft: '4px solid var(--primary-color)' }}>
                <h2 style={{ marginBottom: '15px' }}>Select Students for Attendance</h2>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '8px 16px', borderRadius: '20px', color: 'var(--primary-color)', fontWeight: '500' }}>
                        📅 Event: {eventName}
                    </div>
                    <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '8px 16px', borderRadius: '20px', color: 'var(--primary-color)', fontWeight: '500' }}>
                        🕒 Session: {sessionName}
                    </div>
                </div>
            </div>

            <div className="card p-4">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ flex: '1', minWidth: '280px' }}>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                                🔍
                            </span>
                            <input
                                type="text"
                                placeholder="Search by Name, Email, or Enrollment ID..."
                                value={searchTerm}
                                onChange={handleSearch}
                                style={{
                                    width: '100%',
                                    padding: '12px 20px 12px 45px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: 'var(--bg-color)',
                                    color: 'var(--text-primary)',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    fontSize: '1rem'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', backgroundColor: 'var(--bg-color)', padding: '5px 5px 5px 15px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                            <span style={{ color: 'var(--primary-color)' }}>{selectedStudents.length}</span> selected
                        </span>
                        <button 
                            onClick={handleSelectAll} 
                            style={{
                                padding: '8px 16px',
                                backgroundColor: isAllSelected ? 'var(--primary-hover)' : 'var(--primary-color)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                fontWeight: '500'
                            }}
                        >
                            {isAllSelected ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.3)', borderRadius: '50%', borderTopColor: 'var(--primary-color)', animation: 'spin 1s ease-in-out infinite' }}></div>
                        <p style={{ marginTop: '15px' }}>Loading students...</p>
                    </div>
                ) : (
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                        gap: '15px' 
                    }}>
                        {filteredStudents.length > 0 ? filteredStudents.map(student => {
                            const isSelected = selectedStudents.includes(student._id);
                            return (
                                <div 
                                    key={student._id}
                                    onClick={() => toggleStudent(student._id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '15px',
                                        border: `2px solid ${isSelected ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.05)' : 'var(--card-bg)',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: isSelected ? '0 4px 12px rgba(99, 102, 241, 0.15)' : 'none',
                                        transform: isSelected ? 'translateY(-2px)' : 'none'
                                    }}
                                >
                                    <div style={{ marginRight: '15px', display: 'flex', alignItems: 'center' }}>
                                        <div style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '6px',
                                            border: `2px solid ${isSelected ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                            backgroundColor: isSelected ? 'var(--primary-color)' : 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s'
                                        }}>
                                            {isSelected && <span style={{ color: 'white', fontSize: '14px' }}>✓</span>}
                                        </div>
                                    </div>
                                    {student.profilePhoto ? (
                                        <img 
                                            src={student.profilePhoto} 
                                            alt={student.name}
                                            style={{
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                marginRight: '15px',
                                                border: '2px solid var(--bg-color)'
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            fontSize: '20px',
                                            marginRight: '15px',
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                        }}>
                                            {student.name ? student.name.charAt(0).toUpperCase() : '?'}
                                        </div>
                                    )}
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.05rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', marginBottom: '2px' }}>
                                            {student.name}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                            <span>{student.enrollmentNo ? `#${student.enrollmentNo}` : 'No Enrollment ID'}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', backgroundColor: 'var(--bg-color)', borderRadius: '12px' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🔍</div>
                                <h3 style={{ color: 'var(--text-primary)', marginBottom: '5px' }}>No students found</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search terms</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer Actions Fixed to Bottom */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'var(--card-bg)',
                borderTop: '1px solid var(--border-color)',
                padding: '15px 30px',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '15px',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
                zIndex: 100
            }}>
                <button 
                    onClick={handleCancel}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: 'transparent',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '1rem',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = 'var(--bg-color)'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSubmit}
                    style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '1rem',
                        boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)',
                        transition: 'transform 0.1s, box-shadow 0.1s'
                    }}
                    onMouseDown={(e) => { e.target.style.transform = 'scale(0.98)'; }}
                    onMouseUp={(e) => { e.target.style.transform = 'scale(1)'; }}
                >
                    Confirm Selection ({selectedStudents.length})
                </button>
            </div>
            
            <style>
                {`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    );
};

export default SelectStudents;
