import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const QRScanner = ({ eventId, token, onSuccess }) => {
    const [qrData, setQrData] = useState('');
    const [loading, setLoading] = useState(false);

    const handleManualInput = async (e) => {
        e.preventDefault();
        if (!qrData) {
            toast.error('Please enter QR code data');
            return;
        }

        setLoading(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const { data } = await axios.post(
                `http://localhost:5000/api/events/${eventId}/attendance/qr`,
                { qrData },
                config
            );
            toast.success(data.message || 'Attendance marked successfully!');
            setQrData('');
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error marking attendance:', error);
            toast.error(error.response?.data?.message || 'Failed to mark attendance');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card p-4">
            <h3>Scan QR Code</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Scan the event QR code to mark your attendance automatically.
            </p>

            <div style={{
                padding: '2rem',
                backgroundColor: 'var(--bg-color)',
                borderRadius: '0.75rem',
                textAlign: 'center',
                marginBottom: '1rem'
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📱</div>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Camera scanning feature requires additional setup.
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    For now, you can manually enter the QR code data below.
                </p>
            </div>

            <form onSubmit={handleManualInput}>
                <div className="form-group">
                    <label>QR Code Data (Manual Entry)</label>
                    <textarea
                        className="form-control"
                        value={qrData}
                        onChange={(e) => setQrData(e.target.value)}
                        placeholder='Paste QR code data here (e.g., {"eventId":"...","timestamp":...})'
                        rows="4"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? 'Marking Attendance...' : '✓ Mark Attendance'}
                </button>
            </form>

            <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                backgroundColor: 'var(--bg-color)',
                borderRadius: '0.5rem'
            }}>
                <h4 style={{ marginBottom: '0.5rem' }}>ℹ️ How to use:</h4>
                <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <li>Find the QR code displayed at the event venue</li>
                    <li>Use a QR scanner app to scan the code</li>
                    <li>Copy the decoded data</li>
                    <li>Paste it in the field above and submit</li>
                </ol>
                <p style={{
                    marginTop: '0.5rem',
                    color: 'var(--warning-color)',
                    fontSize: '0.875rem',
                    fontWeight: 'bold'
                }}>
                    ⚠️ Note: QR codes expire after 24 hours
                </p>
            </div>
        </div>
    );
};

export default QRScanner;
