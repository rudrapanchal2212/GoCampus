import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import '../styles.css';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchAnalytics();
        } else {
            fetchBasicStats();
        }
    }, [user]);

    const fetchAnalytics = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get('http://localhost:5000/api/analytics/dashboard', config);
            setAnalytics(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setLoading(false);
        }
    };

    const fetchBasicStats = async () => {
        try {
            const eventsRes = await axios.get('http://localhost:5000/api/events');
            setAnalytics({
                summary: {
                    totalEvents: eventsRes.data.events?.length || 0,
                    totalStudents: 0,
                    totalAttendance: 0
                }
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching stats:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="container"><h2>Loading dashboard...</h2></div>;
    }

    // Events per month chart data
    const eventsPerMonthData = analytics?.eventsPerMonth ? {
        labels: analytics.eventsPerMonth.map(item => {
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${monthNames[item._id.month - 1]} ${item._id.year}`;
        }),
        datasets: [{
            label: 'Events',
            data: analytics.eventsPerMonth.map(item => item.count),
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            tension: 0.4,
            fill: true
        }]
    } : null;

    // Department participation chart data
    const departmentData = analytics?.departmentParticipation ? {
        labels: analytics.departmentParticipation.map(item => item._id || 'Not Specified'),
        datasets: [{
            label: 'Participation',
            data: analytics.departmentParticipation.map(item => item.count),
            backgroundColor: [
                '#4f46e5',
                '#ec4899',
                '#10b981',
                '#f59e0b',
                '#ef4444',
                '#8b5cf6'
            ]
        }]
    } : null;

    // Category distribution chart data
    const categoryData = analytics?.categoryDistribution ? {
        labels: analytics.categoryDistribution.map(item => item._id),
        datasets: [{
            data: analytics.categoryDistribution.map(item => item.count),
            backgroundColor: [
                '#4f46e5',
                '#ec4899',
                '#10b981',
                '#f59e0b',
                '#ef4444',
                '#8b5cf6'
            ]
        }]
    } : null;

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            }
        }
    };

    return (
        <div className="container">
            <h2>Dashboard</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Welcome back, <strong>{user?.name}</strong>! You are logged in as <strong>{user?.role}</strong>.
            </p>

            {/* Summary Cards */}
            <div className="grid dashboard-stats">
                <div className="card stat-card">
                    <div className="stat-value">{analytics?.summary?.totalEvents || 0}</div>
                    <div className="stat-label">Total Events</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-value">{analytics?.summary?.totalStudents || 0}</div>
                    <div className="stat-label">Registered Students</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-value" style={{ color: '#10b981' }}>
                        {analytics?.summary?.attendanceRate ? `${analytics.summary.attendanceRate}%` : 'N/A'}
                    </div>
                    <div className="stat-label">Attendance Rate</div>
                </div>
            </div>

            {user?.role === 'admin' && analytics && (
                <>
                    {/* Charts Row */}
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                        {/* Events Per Month */}
                        {eventsPerMonthData && (
                            <div className="card p-4">
                                <h3 style={{ marginBottom: '1rem' }}>Events Per Month</h3>
                                <div style={{ height: '300px' }}>
                                    <Line data={eventsPerMonthData} options={chartOptions} />
                                </div>
                            </div>
                        )}

                        {/* Department Participation */}
                        {departmentData && (
                            <div className="card p-4">
                                <h3 style={{ marginBottom: '1rem' }}>Department Participation</h3>
                                <div style={{ height: '300px' }}>
                                    <Doughnut data={departmentData} options={chartOptions} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Popular Events & Category Distribution */}
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                        {/* Most Popular Events */}
                        {analytics.popularEvents && analytics.popularEvents.length > 0 && (
                            <div className="card p-4">
                                <h3 style={{ marginBottom: '1rem' }}>Most Popular Events</h3>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {analytics.popularEvents.map((event, index) => (
                                        <li key={event._id} style={{
                                            padding: '0.75rem',
                                            borderBottom: '1px solid var(--border-color)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div>
                                                <strong>{index + 1}. {event.title}</strong>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                    {event.category}
                                                </div>
                                            </div>
                                            <span style={{
                                                backgroundColor: '#4f46e5',
                                                color: 'white',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '1rem',
                                                fontSize: '0.875rem'
                                            }}>
                                                {event.registrationCount} registrations
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Category Distribution */}
                        {categoryData && (
                            <div className="card p-4">
                                <h3 style={{ marginBottom: '1rem' }}>Events by Category</h3>
                                <div style={{ height: '300px' }}>
                                    <Doughnut data={categoryData} options={chartOptions} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Recent Activities */}
                    {analytics.recentActivities && analytics.recentActivities.length > 0 && (
                        <div className="card p-4">
                            <h3 style={{ marginBottom: '1rem' }}>Recent Activities</h3>
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {analytics.recentActivities.map((activity, index) => (
                                    <div key={index} style={{
                                        padding: '0.75rem',
                                        borderBottom: index < analytics.recentActivities.length - 1 ? '1px solid var(--border-color)' : 'none',
                                        display: 'flex',
                                        gap: '1rem',
                                        alignItems: 'flex-start'
                                    }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            backgroundColor: activity.type === 'event_created' ? '#4f46e5' : '#10b981',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            flexShrink: 0
                                        }}>
                                            {activity.type === 'event_created' ? '📅' : '✓'}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div>{activity.message}</div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                                {new Date(activity.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {user?.role === 'student' && (
                <div className="card p-4">
                    <h3>Welcome, Student!</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Browse events, register for upcoming activities, and track your attendance.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
