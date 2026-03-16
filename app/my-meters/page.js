'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyMetersPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [meters, setMeters] = useState([]);
  const [displayManuals, setDisplayManuals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(async d => {
      if (!d.user) { router.push('/login'); return; }
      setUser(d.user);

      // Load user's meters
      const mRes = await fetch('/api/meters?status=my');
      const mData = await mRes.json();
      setMeters(mData.meters || []);

      setLoading(false);
    });
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="page-container fade-in">
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>📋 My Meters</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 30 }}>আপনার জমা দেওয়া মিটার ম্যানুয়াল ও Display Manual সমূহ</p>

      {/* My Meters */}
      <div className="section-header">
        <h2 className="section-title">Meter Manuals</h2>
        <a href="/meters/add" className="btn btn-sm btn-primary">➕ Add New</a>
      </div>

      {meters.length === 0 ? (
        <div className="empty-state" style={{ padding: 30 }}>
          <div className="empty-state-text">আপনি এখনো কোন মিটার ম্যানুয়াল যুক্ত করেননি</div>
          <a href="/meters/add" className="btn btn-primary" style={{ marginTop: 10 }}>➕ Add Meter Manual</a>
        </div>
      ) : (
        <div style={{ marginBottom: 40 }}>
          {meters.map(meter => (
            <div key={meter._id} className="admin-item">
              <div className="admin-item-info">
                <div className="admin-item-title">{meter.item} — {meter.manufacturer}</div>
                <div className="admin-item-meta">
                  {meter.types} • Created: {new Date(meter.createdAt).toLocaleDateString('bn-BD')}
                </div>
              </div>
              <div className="admin-actions">
                <span className={`status-badge status-${meter.status}`}>{meter.status}</span>
                <a href={`/meters/${meter._id}`} className="btn btn-sm btn-secondary">View</a>
                <a href={`/meters/${meter._id}/edit`} className="btn btn-sm btn-secondary">Edit</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
