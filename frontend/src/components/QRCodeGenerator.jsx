import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const QRCodeGenerator = ({ eventId, token }) => {
    const [qrCode, setQrCode] = useState(null);
    const [loading, setLoading] = useState(false);
    const [expiresAt, setExpiresAt] = useState(null);

    const generateQR = async () => {
        setLoading(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const { data } = await axios.get(
                `http://localhost:5000/api/events/${eventId}/qrcode`,
                config
            );
            setQrCode(data.qrCode);
            setExpiresAt(data.expiresAt);
            toast.success('QR Code generated successfully!');
        } catch (error) {
            console.error('Error generating QR:', error);
            toast.error('Failed to generate QR code');
        } finally {
            setLoading(false);
        }
    };

    const downloadQR = () => {
        if (!qrCode) return;

        const link = document.createElement('a');
        link.href = qrCode;
        link.download = `event_qr_${eventId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('QR Code downloaded!');
    };

    return (
        <div className="card p-4">
            <h3>QR Code Attendance</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Generate a QR code for students to scan and mark their attendance automatically.
            </p>

            {!qrCode ? (
                <button
                    onClick={generateQR}
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? 'Generating...' : '📱 Generate QR Code'}
                </button>
            ) : (
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '0.75rem',
                        display: 'inline-block',
                        marginBottom: '1rem'
                    }}>
                        <img
                            src={qrCode}
                            alt="Event QR Code"
                            style={{
                                width: '300px',
                                height: '300px',
                                display: 'block'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            ⏰ Expires: {new Date(expiresAt).toLocaleString()}
                        </p>
                        <p style={{ color: 'var(--warning-color)', fontSize: '0.875rem', fontWeight: 'bold' }}>
                            Valid for 24 hours
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={downloadQR} className="btn btn-primary">
                            📥 Download QR Code
                        </button>
                        <button onClick={generateQR} className="btn btn-secondary">
                            🔄 Regenerate
                        </button>
                    </div>

                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        backgroundColor: 'var(--bg-color)',
                        borderRadius: '0.5rem',
                        textAlign: 'left'
                    }}>
                        <h4 style={{ marginBottom: '0.5rem' }}>📋 Instructions:</h4>
                        <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                            <li>Display this QR code at the event venue</li>
                            <li>Students scan the QR code with their phones</li>
                            <li>Attendance is marked automatically</li>
                            <li>QR code expires after 24 hours for security</li>
                        </ol>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QRCodeGenerator;
