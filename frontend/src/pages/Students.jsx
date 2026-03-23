import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles.css';

const Students = () => {
    const { user } = useContext(AuthContext);
    const [students, setStudents] = useState([]);

    // Fetch registered students (from User collection)
    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get(`http://${window.location.hostname}:5000/api/users/students`, config);
            setStudents(data);
        } catch (error) {
            console.error("Error fetching students:", error);
            toast.error("Failed to fetch students");
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        if (user?.role !== 'admin') {
            toast.error("Only administrators can change roles");
            return;
        }
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            await axios.put(`http://${window.location.hostname}:5000/api/users/${userId}/role`, { role: newRole }, config);
            toast.success("Role updated successfully");
            fetchStudents();
        } catch (error) {
            console.error("Error updating role:", error);
            toast.error("Failed to update role");
        }
    };

    return (
        <div className="container">
            <h2>Registered Students</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
                All students who have registered on the platform
            </p>

            <div className="card p-4">
                <h3>Student List ({students.length})</h3>
                {students.length === 0 ? (
                    <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                        No students registered yet.
                    </p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                                <th style={{ padding: '10px' }}>Name</th>
                                <th style={{ padding: '10px' }}>Email</th>
                                <th style={{ padding: '10px' }}>Department</th>
                                <th style={{ padding: '10px' }}>Enrollment No</th>
                                <th style={{ padding: '10px' }}>Phone</th>
                                <th style={{ padding: '10px' }}>Role</th>
                                <th style={{ padding: '10px' }}>Profile Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student._id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {student.profilePhoto && (
                                                <img
                                                    src={student.profilePhoto}
                                                    alt={student.name}
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '50%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            )}
                                            <span>{student.fullName || student.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '10px' }}>{student.email}</td>
                                    <td style={{ padding: '10px' }}>{student.department || 'N/A'}</td>
                                    <td style={{ padding: '10px' }}>{student.enrollmentNo || 'Not provided'}</td>
                                    <td style={{ padding: '10px' }}>{student.phoneNumber || 'Not provided'}</td>
                                    <td style={{ padding: '10px' }}>
                                        <select
                                            className="form-control"
                                            value={student.role}
                                            onChange={(e) => handleRoleChange(student._id, e.target.value)}
                                            style={{ padding: '4px', fontSize: '0.85rem' }}
                                            disabled={user?.role !== 'admin'}
                                        >
                                            <option value="student">Student</option>
                                            <option value="coordinator">Coordinator</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.85rem',
                                            backgroundColor: student.profileCompleted ? '#d4edda' : '#fff3cd',
                                            color: student.profileCompleted ? '#155724' : '#856404',
                                            border: `1px solid ${student.profileCompleted ? '#c3e6cb' : '#ffeaa7'}`
                                        }}>
                                            {student.profileCompleted ? '✓ Complete' : '⚠ Incomplete'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="card p-4 mt-4" style={{ backgroundColor: '#f8f9fa' }}>
                <h4>ℹ️ Note</h4>
                <p style={{ margin: 0, color: '#666' }}>
                    Students are automatically added when they sign up on the platform.
                    You can promote a student to <b>Coordinator</b>, allowing them to create event proposals for your approval.
                </p>
            </div>
        </div>
    );
};

export default Students;
