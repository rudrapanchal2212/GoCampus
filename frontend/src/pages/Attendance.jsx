import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import Select from 'react-select';
import '../styles.css';

const Attendance = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState('');
    const [status, setStatus] = useState('Present');
    const [session, setSession] = useState('General');
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchEvents();
        fetchStudents();
    }, []);

    useEffect(() => {
        if (selectedEvent) {
            fetchAttendance(selectedEvent);
            fetchEventStats(selectedEvent);
        }
    }, [selectedEvent]);

    const fetchEvents = async () => {
        try {
            const { data } = await axios.get(`http://${window.location.hostname}:5000/api/events`);
            const eventsList = data.events || data || [];
            setEvents(Array.isArray(eventsList) ? eventsList : []);
        } catch (error) {
            console.error("Error fetching events:", error);
            toast.error("Failed to fetch events");
            setEvents([]); // Set to empty array on error
        }
    };

    const fetchStudents = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get(`http://${window.location.hostname}:5000/api/users/students`, config);
            setStudents(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching students:", error);
            setStudents([]); // Set to empty array on error
        }
    };

    const fetchAttendance = async (eventId) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get(
                `http://${window.location.hostname}:5000/api/attendance?event=${eventId}`,
                config
            );
            setAttendance(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching attendance:", error);
            toast.error("Failed to fetch attendance");
            setAttendance([]); // Set to empty array on error
        }
    };

    const fetchEventStats = async (eventId) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get(
                `http://${window.location.hostname}:5000/api/attendance/event/${eventId}/stats`,
                config
            );
            setStats(data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedEvent || selectedStudents.length === 0) {
            toast.error("Please select an event and at least one student");
            return;
        }

        // Add loading state
        const loadingToast = toast.loading(`Marking attendance for ${selectedStudents.length} students...`);

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            await axios.post(
                `http://${window.location.hostname}:5000/api/attendance/bulk`,
                {
                    event: selectedEvent,
                    students: selectedStudents,
                    status,
                    session
                },
                config
            );

            // Dismiss loading toast
            toast.dismiss(loadingToast);
            toast.success(`✓ Marked attendance for ${selectedStudents.length} students!`);

            // Auto-refresh data with smooth transition
            await Promise.all([
                fetchAttendance(selectedEvent),
                fetchEventStats(selectedEvent)
            ]);

            // Reset selection
            setSelectedStudents([]);

            // Optional: Add a subtle success animation effect
            const statsCards = document.querySelectorAll('.stat-card');
            statsCards.forEach(card => {
                card.style.transition = 'transform 0.3s ease';
                card.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    card.style.transform = 'scale(1)';
                }, 300);
            });

        } catch (error) {
            toast.dismiss(loadingToast);
            console.error("Error marking attendance:", error);
            toast.error(error.response?.data?.message || "Failed to mark attendance");
        }
    };

    const handleBulkMark = async () => {
        if (selectedStudents.length === 0) {
            toast.error("Please select students");
            return;
        }
        if (!selectedEvent) {
            toast.error("Please select an event");
            return;
        }

        // Add loading state
        const loadingToast = toast.loading(`Marking attendance for ${selectedStudents.length} students...`);

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            await axios.post(
                `http://${window.location.hostname}:5000/api/attendance/bulk`,
                {
                    event: selectedEvent,
                    students: selectedStudents,
                    status,
                    session
                },
                config
            );

            // Dismiss loading toast
            toast.dismiss(loadingToast);
            toast.success(`✓ Marked attendance for ${selectedStudents.length} students!`);

            // Auto-refresh data with smooth transition
            await Promise.all([
                fetchAttendance(selectedEvent),
                fetchEventStats(selectedEvent)
            ]);

            // Reset selections
            setSelectedStudents([]);

            // Add success animation
            const statsCards = document.querySelectorAll('.stat-card');
            statsCards.forEach(card => {
                card.style.transition = 'transform 0.3s ease';
                card.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    card.style.transform = 'scale(1)';
                }, 300);
            });

        } catch (error) {
            toast.dismiss(loadingToast);
            console.error("Error bulk marking:", error);
            toast.error("Failed to mark bulk attendance");
        }
    };

    const handleExportCSV = async () => {
        if (!selectedEvent) {
            toast.error("Please select an event first");
            return;
        }
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
                responseType: 'blob'
            };
            const response = await axios.get(
                `http://${window.location.hostname}:5000/api/attendance/export/csv?event=${selectedEvent}`,
                config
            );

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `attendance_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success("CSV exported successfully!");
        } catch (error) {
            console.error("Error exporting CSV:", error);
            toast.error("Failed to export CSV");
        }
    };

    const toggleStudentSelection = (studentId) => {
        if (selectedStudents.includes(studentId)) {
            setSelectedStudents(selectedStudents.filter(id => id !== studentId));
        } else {
            setSelectedStudents([...selectedStudents, studentId]);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Present': return '#10b981';
            case 'Late': return '#f59e0b';
            case 'Absent': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const eventOptions = Array.isArray(events) ? events.map(event => ({
        value: event._id,
        label: event.title
    })) : [];

    const studentOptions = Array.isArray(students) ? students.map(student => ({
        value: student._id,
        label: `${student.enrollmentNo ? `${student.enrollmentNo} - ` : ''}${student.name} (${student.email})`
    })) : [];

    const sessionOptions = [
        { value: 'General', label: 'General' },
        { value: 'Morning', label: 'Morning' },
        { value: 'Afternoon', label: 'Afternoon' },
        { value: 'Day 1', label: 'Day 1' },
        { value: 'Day 2', label: 'Day 2' }
    ];

    const statusOptions = [
        { value: 'Present', label: 'Present' },
        { value: 'Late', label: 'Late' },
        { value: 'Absent', label: 'Absent' }
    ];

    const selectStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: 'var(--bg-color)',
            borderColor: state.isFocused ? 'var(--primary-color)' : 'var(--border-color)',
            color: 'var(--text-primary)',
            minHeight: '44px',
            boxShadow: state.isFocused ? '0 0 0 3px rgba(99, 102, 241, 0.15)' : 'none',
            '&:hover': {
                borderColor: state.isFocused ? 'var(--primary-color)' : 'var(--border-color)'
            }
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            zIndex: 100
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected 
                ? 'var(--primary-color)' 
                : state.isFocused 
                    ? 'rgba(99, 102, 241, 0.1)' 
                    : 'transparent',
            color: state.isSelected ? '#fff' : 'var(--text-primary)',
            cursor: 'pointer',
            '&:active': {
                backgroundColor: 'var(--primary-hover)'
            }
        }),
        singleValue: (base) => ({
            ...base,
            color: 'var(--text-primary)',
        }),
        input: (base) => ({
            ...base,
            color: 'var(--text-primary)',
        }),
        placeholder: (base) => ({
            ...base,
            color: 'var(--text-secondary)',
        })
    };

    return (
        <div className="container">
            <h2>Attendance Management</h2>

            {/* Statistics */}
            {stats && (
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="card p-4 stat-card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                            {stats.overall.present}
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>Present</div>
                    </div>
                    <div className="card p-4 stat-card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                            {stats.overall.late}
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>Late</div>
                    </div>
                    <div className="card p-4 stat-card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
                            {stats.overall.absent}
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>Absent</div>
                    </div>
                    <div className="card p-4 stat-card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4f46e5' }}>
                            {stats.overall.percentage}%
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>Attendance Rate</div>
                    </div>
                </div>
            )}

            <div className="card p-4">
                <h3>Mark Attendance</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Select Event</label>
                        <Select
                            options={eventOptions}
                            value={eventOptions.find(opt => opt.value === selectedEvent) || null}
                            onChange={(option) => setSelectedEvent(option ? option.value : '')}
                            placeholder="-- Select Event --"
                            isSearchable
                            styles={selectStyles}
                        />
                    </div>

                    <div className="form-group">
                        <label>Session</label>
                        <Select
                            options={sessionOptions}
                            value={sessionOptions.find(opt => opt.value === session) || sessionOptions[0]}
                            onChange={(option) => setSession(option ? option.value : 'General')}
                            isSearchable={false}
                            styles={selectStyles}
                        />
                    </div>

                    <div className="form-group">
                        <label>Select Students</label>
                        <Select
                            isMulti
                            options={studentOptions}
                            value={studentOptions.filter(opt => selectedStudents.includes(opt.value))}
                            onChange={(options) => setSelectedStudents(options ? options.map(opt => opt.value) : [])}
                            placeholder="-- Select Multiple Students --"
                            isSearchable
                            styles={{
                                ...selectStyles,
                                multiValue: (provided) => ({
                                    ...provided,
                                    backgroundColor: 'var(--primary-color)',
                                }),
                                multiValueLabel: (provided) => ({
                                    ...provided,
                                    color: 'white',
                                }),
                                multiValueRemove: (provided) => ({
                                    ...provided,
                                    color: 'white',
                                    ':hover': {
                                        backgroundColor: '#bc3333',
                                        color: 'white',
                                    },
                                })
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Status</label>
                        <Select
                            options={statusOptions}
                            value={statusOptions.find(opt => opt.value === status) || statusOptions[0]}
                            onChange={(option) => setStatus(option ? option.value : 'Present')}
                            isSearchable={false}
                            styles={selectStyles}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary">Mark Attendance</button>
                </form>
            </div>

            {/* Bulk Marking */}
            {selectedEvent && (
                <div className="card p-4 mt-4">
                    <h3>Bulk Mark Attendance</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        Select students below and click "Mark Selected" to mark attendance for multiple students at once.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <button
                            onClick={handleBulkMark}
                            className="btn btn-primary"
                            disabled={selectedStudents.length === 0}
                        >
                            Mark Selected ({selectedStudents.length})
                        </button>
                        <button onClick={handleExportCSV} className="btn btn-secondary">
                            📥 Export CSV
                        </button>
                    </div>
                </div>
            )}

            {/* Attendance List */}
            <div className="card p-4 mt-4">
                <h3>Attendance List {selectedEvent ? `for Selected Event` : '(Select Event to View)'}</h3>
                {selectedEvent && (
                    <div style={{ overflowX: 'auto' }}>
                        {attendance.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">📋</div>
                                <p>No attendance records found.</p>
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                                        <th style={{ padding: '10px' }}>
                                            <input
                                                type="checkbox"
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedStudents(Array.isArray(students) ? students.map(s => s._id) : []);
                                                    } else {
                                                        setSelectedStudents([]);
                                                    }
                                                }}
                                            />
                                        </th>
                                        <th style={{ padding: '10px' }}>Student</th>
                                        <th style={{ padding: '10px' }}>Session</th>
                                        <th style={{ padding: '10px' }}>Status</th>
                                        <th style={{ padding: '10px' }}>Marked At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(attendance) && attendance.map((record) => (
                                        <tr key={record._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '10px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStudents.includes(record.student?._id)}
                                                    onChange={() => toggleStudentSelection(record.student?._id)}
                                                />
                                            </td>
                                            <td style={{ padding: '10px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    {record.student?.profilePhoto && (
                                                        <img
                                                            src={record.student.profilePhoto}
                                                            alt={record.student.name}
                                                            style={{
                                                                width: '30px',
                                                                height: '30px',
                                                                borderRadius: '50%',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                    )}
                                                    <div>
                                                        <strong>{record.student?.name || 'Unknown'}</strong>
                                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                            {record.student?.enrollmentNo ? `${record.student.enrollmentNo} | ` : ''}
                                                            {record.student?.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '10px' }}>{record.session}</td>
                                            <td style={{ padding: '10px' }}>
                                                <span style={{
                                                    color: getStatusColor(record.status),
                                                    fontWeight: 'bold'
                                                }}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '10px' }}>
                                                {new Date(record.markedAt).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Attendance;
