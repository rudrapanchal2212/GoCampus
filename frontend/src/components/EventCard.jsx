import React from 'react';
import '../styles.css';

// Event Card Component
// Displays event details and actions based on user role
const EventCard = ({ event, user, onDelete, onEdit, onRegister }) => {

    // Check if current user is already registered (if student)
    const isRegistered = user && user.role === 'student' && event.registrations && event.registrations.includes(user._id);

    return (
        <div className="card event-card animate-fade-in">
            <h3 style={{ marginBottom: '10px' }}>{event.title}</h3>
            <p className="event-date">
                <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
            </p>
            <p className="event-time">
                <strong>Time:</strong> {event.time}
            </p>
            <p className="event-location">
                <strong>Location:</strong> {event.location}
            </p>
            <p className="event-organizer">
                <strong>Organizer:</strong> {event.organizer}
            </p>
            <p className="event-description" style={{ margin: '10px 0', color: '#555' }}>
                {event.description}
            </p>

            <div className="event-actions" style={{ marginTop: '15px' }}>
                {user && (user.role === 'admin' || user.role === 'coordinator') && (
                    <>
                        <button onClick={() => onEdit(event)} className="btn btn-primary" style={{ marginRight: '10px' }}>
                            Edit
                        </button>
                        <button onClick={() => onDelete(event._id)} className="btn btn-danger">
                            Delete
                        </button>
                    </>
                )}

                {user && user.role === 'student' && (
                    <button
                        onClick={() => onRegister(event._id)}
                        className={`btn ${isRegistered ? 'btn-secondary' : 'btn-primary'}`}
                        disabled={isRegistered}
                        style={{ backgroundColor: isRegistered ? '#6c757d' : '' }}
                    >
                        {isRegistered ? 'Registered' : 'Register Now'}
                    </button>
                )}
            </div>
            <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#888' }}>
                {event.registrations ? event.registrations.length : 0} student(s) going
            </div>
        </div>
    );
};

export default EventCard;
