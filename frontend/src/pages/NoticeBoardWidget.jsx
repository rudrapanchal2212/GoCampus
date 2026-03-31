import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';

const TYPE_CONFIG = {
    info:    { color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe', icon: 'ℹ️', label: 'Info' },
    warning: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: '⚠️', label: 'Warning' },
    urgent:  { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: '🚨', label: 'Urgent' },
    success: { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', icon: '✅', label: 'Update' },
};

const timeAgo = (dateStr) => {
    const now = new Date();
    const then = new Date(dateStr);
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60)    return `${diff}s ago`;
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

const EMPTY_FORM = { title: '', content: '', type: 'info', isPinned: false, relatedEvent: '' };

const NoticeBoardWidget = () => {
    const { user } = useContext(AuthContext);
    const isAdmin = user?.role === 'admin' || user?.role === 'coordinator';

    const [announcements, setAnnouncements] = useState([]);
    const [events, setEvents] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnnouncements();
        if (isAdmin) fetchEvents();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const { data } = await axios.get(`${(import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "")}/api/announcements`);
            setAnnouncements(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch announcements', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchEvents = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${(import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "")}/api/events?limit=50`, config);
            setEvents(data.events || []);
        } catch (err) { /* silently ignore */ }
    };

    const authHeader = () => ({
        headers: { Authorization: `Bearer ${user.token}` }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...form,
            relatedEvent: form.relatedEvent || null,
        };
        try {
            if (editingId) {
                await axios.put(`${(import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "")}/api/announcements/${editingId}`, payload, authHeader());
                toast.success('Announcement updated!');
            } else {
                await axios.post(`${(import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "")}/api/announcements`, payload, authHeader());
                toast.success('Announcement posted!');
            }
            setShowForm(false);
            setEditingId(null);
            setForm(EMPTY_FORM);
            fetchAnnouncements();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save announcement');
        }
    };

    const handleEdit = (ann) => {
        setForm({
            title: ann.title,
            content: ann.content,
            type: ann.type,
            isPinned: ann.isPinned,
            relatedEvent: ann.relatedEvent?._id || '',
        });
        setEditingId(ann._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this announcement?')) return;
        try {
            await axios.delete(`${(import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "")}/api/announcements/${id}`, authHeader());
            toast.success('Announcement removed');
            fetchAnnouncements();
        } catch (err) {
            toast.error('Failed to remove announcement');
        }
    };

    const handleTogglePin = async (ann) => {
        try {
            await axios.put(
                `${(import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "")}/api/announcements/${ann._id}`,
                { isPinned: !ann.isPinned },
                authHeader()
            );
            fetchAnnouncements();
        } catch (err) {
            toast.error('Failed to update pin status');
        }
    };

    return (
        <div style={{ marginBottom: '2rem' }}>
            {/* ── Header ── */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '1rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.4rem' }}>📢</span>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        Notice Board
                    </h3>
                    {announcements.length > 0 && (
                        <span style={{
                            background: '#4f46e5', color: 'white', borderRadius: '999px',
                            padding: '0.1rem 0.55rem', fontSize: '0.75rem', fontWeight: '700'
                        }}>{announcements.length}</span>
                    )}
                </div>
                {isAdmin && (
                    <button
                        onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(EMPTY_FORM); }}
                        className="btn btn-primary"
                        style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                    >
                        {showForm ? '✕ Cancel' : '+ New Announcement'}
                    </button>
                )}
            </div>

            {/* ── Admin Form ── */}
            {isAdmin && showForm && (
                <div className="card p-4" style={{
                    marginBottom: '1.5rem',
                    border: '2px solid #c7d2fe',
                    background: 'var(--surface-color)',
                    animation: 'fadeIn 0.2s ease'
                }}>
                    <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
                        {editingId ? '✏️ Edit Announcement' : '📣 Post New Announcement'}
                    </h4>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label>Title <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    placeholder="e.g. Event Cancelled – Heavy Rain"
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label>Type</label>
                                <select
                                    className="form-control"
                                    value={form.type}
                                    onChange={e => setForm({ ...form, type: e.target.value })}
                                >
                                    <option value="info">ℹ️ Info</option>
                                    <option value="success">✅ Update</option>
                                    <option value="warning">⚠️ Warning</option>
                                    <option value="urgent">🚨 Urgent</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Message <span style={{ color: 'red' }}>*</span></label>
                            <textarea
                                className="form-control"
                                rows="3"
                                value={form.content}
                                onChange={e => setForm({ ...form, content: e.target.value })}
                                placeholder="Write the full announcement text here..."
                                required
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label>Link to Event (optional)</label>
                                <select
                                    className="form-control"
                                    value={form.relatedEvent}
                                    onChange={e => setForm({ ...form, relatedEvent: e.target.value })}
                                >
                                    <option value="">— None —</option>
                                    {events.map(ev => (
                                        <option key={ev._id} value={ev._id}>{ev.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group" style={{ margin: 0, paddingTop: '1.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    id="isPinned"
                                    checked={form.isPinned}
                                    onChange={e => setForm({ ...form, isPinned: e.target.checked })}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <label htmlFor="isPinned" style={{ cursor: 'pointer', fontWeight: '600', userSelect: 'none' }}>
                                    📌 Pin to top of feed
                                </label>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                {editingId ? '💾 Save Changes' : '📣 Post Announcement'}
                            </button>
                            <button
                                type="button" className="btn btn-secondary"
                                onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Feed ── */}
            {loading ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>
                    Loading announcements…
                </p>
            ) : announcements.length === 0 ? (
                <div className="card p-4" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📋</div>
                    <p style={{ margin: 0 }}>No announcements yet. Check back later!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {announcements.map(ann => {
                        const cfg = TYPE_CONFIG[ann.type] || TYPE_CONFIG.info;
                        return (
                            <div
                                key={ann._id}
                                style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    alignItems: 'flex-start',
                                    padding: '1rem 1.25rem',
                                    borderRadius: '10px',
                                    border: `1.5px solid ${cfg.border}`,
                                    backgroundColor: cfg.bg,
                                    boxShadow: ann.isPinned ? `0 0 0 2px ${cfg.color}33` : 'none',
                                    position: 'relative',
                                    transition: 'box-shadow 0.2s ease'
                                }}
                            >
                                {/* Type icon */}
                                <div style={{
                                    fontSize: '1.5rem', flexShrink: 0, lineHeight: 1,
                                    marginTop: '0.1rem'
                                }}>
                                    {cfg.icon}
                                </div>

                                {/* Body */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                                        {ann.isPinned && (
                                            <span style={{
                                                fontSize: '0.7rem', fontWeight: '700', padding: '0.1rem 0.45rem',
                                                borderRadius: '4px', background: cfg.color, color: '#fff',
                                                textTransform: 'uppercase', letterSpacing: '0.04em'
                                            }}>📌 Pinned</span>
                                        )}
                                        <span style={{
                                            fontSize: '0.7rem', fontWeight: '700', padding: '0.1rem 0.45rem',
                                            borderRadius: '4px', background: cfg.color, color: '#fff',
                                            textTransform: 'uppercase', letterSpacing: '0.04em'
                                        }}>{cfg.label}</span>
                                        <strong style={{ color: cfg.color, fontSize: '1rem' }}>{ann.title}</strong>
                                    </div>
                                    <p style={{ margin: '0.3rem 0 0.5rem 0', color: '#374151', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                        {ann.content}
                                    </p>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.78rem', color: '#6b7280', flexWrap: 'wrap' }}>
                                        <span>By <strong>{ann.createdBy?.name || 'Admin'}</strong></span>
                                        <span>·</span>
                                        <span>{timeAgo(ann.createdAt)}</span>
                                        {ann.relatedEvent && (
                                            <>
                                                <span>·</span>
                                                <span style={{ color: '#4f46e5' }}>
                                                    🔗 {ann.relatedEvent.title}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Admin Controls */}
                                {isAdmin && (
                                    <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                                        <button
                                            title={ann.isPinned ? 'Unpin' : 'Pin to top'}
                                            onClick={() => handleTogglePin(ann)}
                                            style={{
                                                background: ann.isPinned ? cfg.color : 'transparent',
                                                color: ann.isPinned ? '#fff' : cfg.color,
                                                border: `1px solid ${cfg.color}`,
                                                borderRadius: '6px',
                                                padding: '0.25rem 0.5rem',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                fontWeight: '700'
                                            }}
                                        >
                                            📌
                                        </button>
                                        <button
                                            onClick={() => handleEdit(ann)}
                                            style={{
                                                background: 'transparent',
                                                color: '#4b5563',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                padding: '0.25rem 0.5rem',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem'
                                            }}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDelete(ann._id)}
                                            style={{
                                                background: 'transparent',
                                                color: '#ef4444',
                                                border: '1px solid #fca5a5',
                                                borderRadius: '6px',
                                                padding: '0.25rem 0.5rem',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem'
                                            }}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default NoticeBoardWidget;
