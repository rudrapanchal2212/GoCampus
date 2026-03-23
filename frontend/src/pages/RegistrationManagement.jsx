import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles.css';

const RegistrationManagement = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const { data } = await axios.get(`http://${window.location.hostname}:5000/api/events`);
            const eventsList = data.events || data || [];
            setEvents(Array.isArray(eventsList) ? eventsList : []);
        } catch (error) {
            console.error('Error fetching events:', error);
            toast.error('Failed to fetch events');
            setEvents([]);
        }
    };

    const fetchEventDetails = async (eventId) => {
        if (!eventId) return;
        setLoading(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get(
                `http://${window.location.hostname}:5000/api/events/${eventId}`,
                config
            );
            setSelectedEvent(data);
            setRegistrations(data.registrations || []);
        } catch (error) {
            console.error('Error fetching event details:', error);
            toast.error('Failed to fetch event details');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId) => {
        const loadingToast = toast.loading("Approving registration...");
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            await axios.put(
                `http://${window.location.hostname}:5000/api/events/${selectedEvent._id}/registrations/${userId}/approve`,
                {},
                config
            );
            toast.dismiss(loadingToast);
            toast.success('✓ Registration approved!');
            await fetchEventDetails(selectedEvent._id);
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error('Error approving registration:', error);
            toast.error('Failed to approve registration');
        }
    };

    const handleReject = async (userId) => {
        const loadingToast = toast.loading("Rejecting registration...");
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            await axios.put(
                `http://${window.location.hostname}:5000/api/events/${selectedEvent._id}/registrations/${userId}/reject`,
                {},
                config
            );
            toast.dismiss(loadingToast);
            toast.success('Registration rejected');
            await fetchEventDetails(selectedEvent._id);
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error('Error rejecting registration:', error);
            toast.error('Failed to reject registration');
        }
    };

    const handleApproveAll = async () => {
        const pendingUsers = registrations.filter(r => r.status === 'pending');
        if (pendingUsers.length === 0) return;
        
        const loadingToast = toast.loading(`Approving ${pendingUsers.length} registrations...`);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            
            await Promise.all(pendingUsers.map(reg => 
                axios.put(
                    `http://${window.location.hostname}:5000/api/events/${selectedEvent._id}/registrations/${reg.user._id}/approve`,
                    {},
                    config
                )
            ));
            
            toast.dismiss(loadingToast);
            toast.success(`✓ Successfully approved ${pendingUsers.length} registrations!`);
            await fetchEventDetails(selectedEvent._id);
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error('Error approving all registrations:', error);
            toast.error('Failed to approve some registrations. Please check and try again.');
            await fetchEventDetails(selectedEvent._id);
        }
    };

    const handleRejectAll = async () => {
        const pendingUsers = registrations.filter(r => r.status === 'pending');
        if (pendingUsers.length === 0) return;
        
        const loadingToast = toast.loading(`Rejecting ${pendingUsers.length} registrations...`);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            
            await Promise.all(pendingUsers.map(reg => 
                axios.put(
                    `http://${window.location.hostname}:5000/api/events/${selectedEvent._id}/registrations/${reg.user._id}/reject`,
                    {},
                    config
                )
            ));
            
            toast.dismiss(loadingToast);
            toast.success(`✓ Successfully rejected ${pendingUsers.length} registrations!`);
            await fetchEventDetails(selectedEvent._id);
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error('Error rejecting all registrations:', error);
            toast.error('Failed to reject some registrations. Please check and try again.');
            await fetchEventDetails(selectedEvent._id);
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            pending: { bg: '#fef3c7', color: '#92400e' },
            approved: { bg: '#d1fae5', color: '#065f46' },
            rejected: { bg: '#fee2e2', color: '#991b1b' }
        };
        const style = colors[status] || colors.pending;

        return (
            <span style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '1rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                backgroundColor: style.bg,
                color: style.color
            }}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const pendingCount = Array.isArray(registrations) ? registrations.filter(r => r.status === 'pending').length : 0;
    const approvedCount = Array.isArray(registrations) ? registrations.filter(r => r.status === 'approved').length : 0;
    const rejectedCount = Array.isArray(registrations) ? registrations.filter(r => r.status === 'rejected').length : 0;

    return (
        <div className="container">
            <h2>Registration Management</h2>

            <div className="card p-4">
                <h3>Select Event</h3>
                <select
                    className="form-control"
                    onChange={(e) => {
                        const eventId = e.target.value;
                        if (eventId) {
                            fetchEventDetails(eventId);
                        } else {
                            setSelectedEvent(null);
                            setRegistrations([]);
                        }
                    }}
                    value={selectedEvent?._id || ''}
                >
                    <option value="">-- Select Event --</option>
                    {Array.isArray(events) && events.map(event => (
                        <option key={event._id} value={event._id}>
                            {event.title} - {new Date(event.date).toLocaleDateString()}
                        </option>
                    ))}
                </select>
            </div>

            {selectedEvent && (
                <>
                    {/* Event Summary */}
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
                        <div className="card p-4" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                                {pendingCount}
                            </div>
                            <div style={{ color: 'var(--text-secondary)' }}>Pending</div>
                        </div>
                        <div className="card p-4" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                                {approvedCount}
                            </div>
                            <div style={{ color: 'var(--text-secondary)' }}>Approved</div>
                        </div>
                        <div className="card p-4" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
                                {rejectedCount}
                            </div>
                            <div style={{ color: 'var(--text-secondary)' }}>Rejected</div>
                        </div>
                        <div className="card p-4" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4f46e5' }}>
                                {selectedEvent.registrationLimit || '∞'}
                            </div>
                            <div style={{ color: 'var(--text-secondary)' }}>Limit</div>
                        </div>
                    </div>

                    {/* Registrations List */}
                    <div className="card p-4" style={{ marginTop: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>Registrations</h3>
                            {pendingCount > 0 && (
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button 
                                        onClick={handleApproveAll}
                                        className="btn btn-primary"
                                        style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                    >
                                        <span>✓</span> Approve All
                                    </button>
                                    <button 
                                        onClick={handleRejectAll}
                                        className="btn btn-secondary"
                                        style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                    >
                                        <span>✗</span> Reject All
                                    </button>
                                </div>
                            )}
                        </div>

                        {loading ? (
                            <p>Loading registrations...</p>
                        ) : registrations.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">📝</div>
                                <p>No registrations yet for this event.</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                                            <th style={{ padding: '10px' }}>Student / Team</th>
                                            <th style={{ padding: '10px' }}>Department</th>
                                            <th style={{ padding: '10px' }}>Registered At</th>
                                            <th style={{ padding: '10px' }}>Status</th>
                                            <th style={{ padding: '10px' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {registrations.map((registration) => (
                                            <tr key={registration._id || registration.user?._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <td style={{ padding: '10px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                                        {registration.user?.profilePhoto && (
                                                            <img
                                                                src={registration.user.profilePhoto}
                                                                alt={registration.user.name}
                                                                style={{
                                                                    width: '40px',
                                                                    height: '40px',
                                                                    borderRadius: '50%',
                                                                    objectFit: 'cover'
                                                                }}
                                                            />
                                                        )}
                                                        <div>
                                                            <strong>{registration.user?.name || 'Unknown'} {registration.teamName ? `(Lead)` : ''}</strong>
                                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                                {registration.user?.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {registration.teamName && (
                                                        <div style={{ marginTop: '8px', padding: '8px', backgroundColor: 'var(--bg-color)', borderRadius: '4px', fontSize: '0.85rem' }}>
                                                            <strong>Team: {registration.teamName}</strong>
                                                            {registration.teamMembers && registration.teamMembers.length > 0 && (
                                                                <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', color: 'var(--text-secondary)' }}>
                                                                    {registration.teamMembers.map(member => (
                                                                        <li key={member._id || member}>{member.name || 'Student'}</li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '10px' }}>
                                                    {registration.user?.department || 'N/A'}
                                                </td>
                                                <td style={{ padding: '10px' }}>
                                                    {new Date(registration.registeredAt).toLocaleString()}
                                                </td>
                                                <td style={{ padding: '10px' }}>
                                                    {getStatusBadge(registration.status)}
                                                </td>
                                                <td style={{ padding: '10px' }}>
                                                    {registration.status === 'pending' && (
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button
                                                                onClick={() => handleApprove(registration.user._id)}
                                                                className="btn btn-primary"
                                                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                                                            >
                                                                ✓ Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(registration.user._id)}
                                                                className="btn btn-secondary"
                                                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                                                            >
                                                                ✗ Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                    {registration.status === 'approved' && (
                                                        <span style={{ color: '#10b981' }}>✓ Approved</span>
                                                    )}
                                                    {registration.status === 'rejected' && (
                                                        <span style={{ color: '#ef4444' }}>✗ Rejected</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Waiting List */}
                    {selectedEvent.waitingList && selectedEvent.waitingList.length > 0 && (
                        <div className="card p-4" style={{ marginTop: '2rem' }}>
                            <h3>Waiting List ({selectedEvent.waitingList.length})</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Students waiting for a spot when the event reaches capacity.
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {selectedEvent.waitingList.map((userId, index) => (
                                    <li key={userId} style={{
                                        padding: '0.75rem',
                                        borderBottom: '1px solid var(--border-color)'
                                    }}>
                                        Position {index + 1}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default RegistrationManagement;
