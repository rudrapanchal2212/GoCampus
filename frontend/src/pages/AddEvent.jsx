import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';

const AddEvent = () => {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        organizer: '',
        category: 'Other',
        tags: '',
        registrationLimit: 0,
        subEvents: [],
        isTeamEvent: false,
        minTeamSize: 1,
        maxTeamSize: 1
    });
    const [isEditMode, setIsEditMode] = useState(false);
    const { state } = useLocation();
    const navigate = useNavigate();

    // Pre-fill form if editing
    useEffect(() => {
        if (state && state.event) {
            setIsEditMode(true);
            const { title, description, date, time, location, organizer, category, tags, registrationLimit, subEvents, isTeamEvent, minTeamSize, maxTeamSize } = state.event;
            const formattedDate = new Date(date).toISOString().split('T')[0];
            setFormData({
                title,
                description,
                date: formattedDate,
                time,
                location,
                organizer,
                category: category || 'Other',
                tags: tags ? tags.join(', ') : '',
                registrationLimit: registrationLimit || 0,
                subEvents: subEvents || [],
                isTeamEvent: isTeamEvent || false,
                minTeamSize: minTeamSize || 1,
                maxTeamSize: maxTeamSize || 1
            });
        }
    }, [state]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubEventChange = (index, e) => {
        const { name, value } = e.target;
        const newSubEvents = [...formData.subEvents];
        newSubEvents[index][name] = value;
        setFormData({ ...formData, subEvents: newSubEvents });
    };

    const addSubEvent = () => {
        setFormData({
            ...formData,
            subEvents: [...formData.subEvents, { title: '', description: '', time: '', location: '' }]
        });
    };

    const removeSubEvent = (index) => {
        const newSubEvents = formData.subEvents.filter((_, i) => i !== index);
        setFormData({ ...formData, subEvents: newSubEvents });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const config = {
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
        };

        // Convert tags string to array
        const eventData = {
            ...formData,
            tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
            registrationLimit: parseInt(formData.registrationLimit) || 0
        };

        try {
            if (isEditMode) {
                await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/events/${state.event._id}`, eventData, config);
                toast.success('Event Updated Successfully!');
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/events`, eventData, config);
                toast.success('Event Created Successfully!');
            }
            navigate('/events');
        } catch (error) {
            console.error("Error saving event:", error);
            toast.error(error.response?.data?.message || 'Failed to save event');
        }
    };

    return (
        <div className="container">
            <h2>{isEditMode ? 'Edit Event' : 'Add New Event'}</h2>
            <form onSubmit={handleSubmit} className="card p-4">
                <div className="form-group">
                    <label>Event Title</label>
                    <input
                        type="text"
                        className="form-control"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <textarea
                        className="form-control"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    ></textarea>
                </div>

                <div className="form-group">
                    <label>Date</label>
                    <input
                        type="date"
                        className="form-control"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Time</label>
                    <input
                        type="text"
                        className="form-control"
                        name="time"
                        placeholder="Ex: 10:00 AM"
                        value={formData.time}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Location</label>
                    <input
                        type="text"
                        className="form-control"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Organizer</label>
                    <input
                        type="text"
                        className="form-control"
                        name="organizer"
                        value={formData.organizer}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Category</label>
                    <select
                        className="form-control"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                    >
                        <option value="Workshop">Workshop</option>
                        <option value="Seminar">Seminar</option>
                        <option value="Sports">Sports</option>
                        <option value="Cultural">Cultural</option>
                        <option value="Technical">Technical</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Tags (comma-separated)</label>
                    <input
                        type="text"
                        className="form-control"
                        name="tags"
                        placeholder="Ex: coding, tech, workshop"
                        value={formData.tags}
                        onChange={handleChange}
                    />
                    <small style={{ color: 'var(--text-secondary)' }}>
                        Separate tags with commas. Example: coding, tech, workshop
                    </small>
                </div>

                <div className="form-group">
                    <label>Registration Limit</label>
                    <input
                        type="number"
                        className="form-control"
                        name="registrationLimit"
                        placeholder="0 for unlimited"
                        value={formData.registrationLimit}
                        onChange={handleChange}
                        min="0"
                    />
                    <small style={{ color: 'var(--text-secondary)' }}>
                        Set to 0 for unlimited registrations
                    </small>
                </div>

                <div className="form-group">
                    <label>
                        <input
                            type="checkbox"
                            name="isTeamEvent"
                            checked={formData.isTeamEvent}
                            onChange={handleChange}
                            style={{ marginRight: '0.5rem' }}
                        />
                        This is a Team / Group Event
                    </label>
                </div>

                {formData.isTeamEvent && (
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Minimum Team Size</label>
                            <input
                                type="number"
                                className="form-control"
                                name="minTeamSize"
                                value={formData.minTeamSize}
                                onChange={handleChange}
                                min="1"
                                required={formData.isTeamEvent}
                            />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Maximum Team Size</label>
                            <input
                                type="number"
                                className="form-control"
                                name="maxTeamSize"
                                value={formData.maxTeamSize}
                                onChange={handleChange}
                                min="1"
                                required={formData.isTeamEvent}
                            />
                        </div>
                    </div>
                )}

                <div className="form-group mb-4">
                    <h3>Sub Events</h3>
                    {formData.subEvents.map((subEvent, index) => (
                        <div key={index} className="card p-3 mb-3" style={{ backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5>Sub Event {index + 1}</h5>
                                <button type="button" className="btn btn-sm btn-danger" onClick={() => removeSubEvent(index)}>
                                    Remove
                                </button>
                            </div>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="title"
                                    value={subEvent.title}
                                    onChange={(e) => handleSubEventChange(index, e)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    className="form-control"
                                    name="description"
                                    value={subEvent.description}
                                    onChange={(e) => handleSubEventChange(index, e)}
                                ></textarea>
                            </div>
                            <div className="row">
                                <div className="col-md-6 form-group">
                                    <label>Time</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="time"
                                        value={subEvent.time}
                                        onChange={(e) => handleSubEventChange(index, e)}
                                    />
                                </div>
                                <div className="col-md-6 form-group">
                                    <label>Location</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="location"
                                        value={subEvent.location}
                                        onChange={(e) => handleSubEventChange(index, e)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    <button type="button" className="btn btn-secondary mt-2" onClick={addSubEvent}>
                        + Add Sub Event
                    </button>
                </div>

                <button type="submit" className="btn btn-primary btn-block p-2 mt-4" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {isEditMode ? 'Update Event' : 'Create Event'}
                </button>
            </form>
        </div>
    );
};

export default AddEvent;
