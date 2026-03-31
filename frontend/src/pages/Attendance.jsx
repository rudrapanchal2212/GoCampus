import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import Select from 'react-select';
import '../styles.css';

const Attendance = () => {
    const navigate = useNavigate();
    const location = useLocation();
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
            const { data } = await axios.get(`${(import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "")}/api/events`);
            const eventsList = data.events || data || [];
            setEvents(Array.isArray(eventsList) ? eventsList : []);
        } catch (error) {
            console.error("Error fetching events:", error);
            toast.error("Failed to fetch events");
            setEvents([]);
        }
    };

    const fetchStudents = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get(`${(import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "")}/api/users/students`, config);
            setStudents(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching students:", error);
            setStudents([]); 
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
                `${(import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "")}/api/attendance?event=${eventId}`,
                config
            );
            setAttendance(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching attendance:", error);
            setAttendance([]);
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
                `${(import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "")}/api/attendance/event/${eventId}/stats`,
                config
            );
            setStats(data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const handleSaveAttendance = async () => {
        if (!selectedEvent) {
            toast.error("Please select an event");
            return;
        }
        if (selectedStudents.length === 0) {
            toast.error("Please select at least one student");
            return;
        }

        const loadingToast = toast.loading(`Saving attendance for ${selectedStudents.length} students...`);

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            await axios.post(
                `${(import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "")}/api/attendance/bulk`,
                {
                    event: selectedEvent,
                    students: selectedStudents,
                    status: 'Present', // Or use chosen status
                    session
                },
                config
            );

            toast.dismiss(loadingToast);
            toast.success(`✓ Marked attendance for ${selectedStudents.length} students!`);

            await Promise.all([
                fetchAttendance(selectedEvent),
                fetchEventStats(selectedEvent)
            ]);

            setSelectedStudents([]);
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error("Error saving attendance:", error);
            toast.error(error.response?.data?.message || "Failed to mark attendance");
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
                `${(import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "")}/api/attendance/export/csv?event=${selectedEvent}`,
                config
            );

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

    const eventOptions = Array.isArray(events) ? events.map(event => ({
        value: event._id,
        label: event.title
    })) : [];

    const sessionOptions = [
        { value: 'General', label: 'General' },
        { value: 'Morning', label: 'Morning' },
        { value: 'Afternoon', label: 'Afternoon' },
        { value: 'Day 1', label: 'Day 1' },
        { value: 'Day 2', label: 'Day 2' }
    ];

    const selectStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: 'var(--bg-color)',
            borderColor: state.isFocused ? 'var(--primary-color)' : 'var(--border-color)',
            boxShadow: 'none',
            '&:hover': {
                borderColor: 'var(--primary-color)'
            }
        }),
        menu: (base) => ({
            ...base,
            zIndex: 9999,
            backgroundColor: 'var(--card-bg)' || '#fff',
            border: '1px solid var(--border-color)'
        }),
        menuPortal: (base) => ({
            ...base,
            zIndex: 9999
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected 
                ? 'var(--primary-color)' 
                : state.isFocused 
                    ? 'rgba(99, 102, 241, 0.1)' 
                    : 'transparent',
            color: state.isSelected ? '#fff' : 'var(--text-primary)',
            cursor: 'pointer'
        })
    };

    // Grouping logic for rendering
    const groupedStudents = students.reduce((acc, student) => {
        const dept = student.department || 'Other';
        if (!acc[dept]) acc[dept] = [];
        acc[dept].push(student);
        return acc;
    }, {});

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>Attendance Register</h2>
                <button 
                    onClick={handleExportCSV} 
                    style={{
                        padding: '8px 16px',
                        backgroundColor: 'white',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '500'
                    }}
                >
                    📥 Export CSV
                </button>
            </div>

            <div className="card" style={{ padding: '20px', marginBottom: '30px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Select Event</label>
                        <Select
                            options={eventOptions}
                            value={eventOptions.find(opt => opt.value === selectedEvent) || null}
                            onChange={(option) => setSelectedEvent(option ? option.value : '')}
                            placeholder="Select Event"
                            isSearchable
                            styles={selectStyles}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Select Session</label>
                        <Select
                            options={sessionOptions}
                            value={sessionOptions.find(opt => opt.value === session) || sessionOptions[0]}
                            onChange={(option) => setSession(option ? option.value : 'General')}
                            isSearchable={false}
                            styles={selectStyles}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                        />
                    </div>
                </div>
            </div>

            <div className="card" style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Class Register</h3>
                    <button 
                        onClick={handleSaveAttendance}
                        style={{
                            padding: '8px 20px',
                            backgroundColor: '#4f46e5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: '500'
                        }}
                    >
                        💾 Save Attendance
                    </button>
                </div>

                <div style={{ padding: '20px' }}>
                    {Object.keys(groupedStudents).length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>No students available.</p>
                    ) : (
                        Object.keys(groupedStudents).sort().map(dept => {
                            const deptStudents = groupedStudents[dept];
                            const allSelected = deptStudents.length > 0 && deptStudents.every(s => selectedStudents.includes(s._id));
                            
                            const handleSelectAllDept = () => {
                                if (allSelected) {
                                    const idsToRemove = deptStudents.map(s => s._id);
                                    setSelectedStudents(selectedStudents.filter(id => !idsToRemove.includes(id)));
                                } else {
                                    const idsToAdd = deptStudents.map(s => s._id).filter(id => !selectedStudents.includes(id));
                                    setSelectedStudents([...selectedStudents, ...idsToAdd]);
                                }
                            };

                            return (
                                <div key={dept} style={{ marginBottom: '30px' }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        backgroundColor: '#f8fafc',
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        marginBottom: '16px',
                                        borderLeft: '4px solid #4f46e5'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>{dept}</h4>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{deptStudents.length} students</span>
                                        </div>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={allSelected}
                                                onChange={handleSelectAllDept}
                                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                            />
                                            Select All
                                        </label>
                                    </div>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                                        {deptStudents.map(student => (
                                            <div 
                                                key={student._id} 
                                                onClick={() => toggleStudentSelection(student._id)}
                                                style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: '16px',
                                                    padding: '12px 16px',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: '8px',
                                                    width: 'calc(50% - 8px)',
                                                    minWidth: '280px',
                                                    cursor: 'pointer',
                                                    transition: 'border-color 0.2s',
                                                    borderColor: selectedStudents.includes(student._id) ? '#4f46e5' : 'var(--border-color)',
                                                    backgroundColor: selectedStudents.includes(student._id) ? '#eef2ff' : 'white'
                                                }}
                                            >
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedStudents.includes(student._id)}
                                                    onChange={() => {}} // handled by parent div onClick
                                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                />
                                                <div style={{ 
                                                    width: '40px', 
                                                    height: '40px', 
                                                    borderRadius: '50%',
                                                    backgroundColor: '#e2e8f0',
                                                    color: '#64748b',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.9rem',
                                                    overflow: 'hidden'
                                                }}>
                                                    {student.profilePhoto ? (
                                                        <img src={student.profilePhoto} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        getInitials(student.name)
                                                    )}
                                                </div>
                                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                                    <div style={{ fontWeight: '500', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {student.name}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {student.email}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
export default Attendance;
