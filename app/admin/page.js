'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending-meters');
  const [data, setData] = useState({
    pendingMeters: [], pendingDisplayManuals: [],
    allMeters: [], allDisplayManuals: [],
    metersWithPendingImages: []
  });
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user || !d.user.isAdmin) { router.push('/'); return; }
      setUser(d.user);
      loadData();
    });
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch('/api/admin/pending');
      const result = await res.json();
      setData(result);
    } catch (e) {}
    setLoading(false);
  };

  const handleAction = async (type, id, action, imageIndex) => {
    setActionLoading(`${type}-${id}-${action}`);
    try {
      await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, action, imageIndex })
      });
      await loadData();
    } catch (e) {}
    setActionLoading('');
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const tabs = [
    { id: 'pending-meters', label: `Pending Meters (${data.pendingMeters?.length || 0})` },
    { id: 'pending-dm', label: `Pending Display (${data.pendingDisplayManuals?.length || 0})` },
    { id: 'pending-images', label: `Pending Images (${data.metersWithPendingImages?.length || 0})` },
    { id: 'all-meters', label: `All Meters (${data.allMeters?.length || 0})` },
    { id: 'all-dm', label: `All Display (${data.allDisplayManuals?.length || 0})` },
  ];

  return (
    <div className="page-container fade-in">
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>⚙️ Admin Dashboard</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>সমস্ত submissions পরিচালনা করুন</p>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map(t => (
          <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Pending Meters */}
      {tab === 'pending-meters' && (
        <div>
          {data.pendingMeters?.length === 0 && <div className="empty-state"><div className="empty-state-text">কোন pending meter নেই</div></div>}
          {data.pendingMeters?.map(meter => (
            <div key={meter._id} className="admin-item">
              <div className="admin-item-info">
                <div className="admin-item-title">{meter.item} — {meter.manufacturer}</div>
                <div className="admin-item-meta">{meter.types} • By: {meter.createdBy?.fullName} • {new Date(meter.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="admin-actions">
                <a href={`/meters/${meter._id}`} className="btn btn-sm btn-secondary">View</a>
                <a href={`/meters/${meter._id}/edit`} className="btn btn-sm btn-secondary">Edit</a>
                <button className="btn btn-sm btn-success" disabled={actionLoading === `meter-${meter._id}-approve`} onClick={() => handleAction('meter', meter._id, 'approve')}>
                  {actionLoading === `meter-${meter._id}-approve` ? '...' : '✓ Approve'}
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => handleAction('meter', meter._id, 'reject')}>✕ Reject</button>
                <button className="btn btn-sm btn-danger" onClick={() => { if(confirm('Delete?')) handleAction('meter', meter._id, 'delete'); }}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pending Display Manuals */}
      {tab === 'pending-dm' && (
        <div>
          {data.pendingDisplayManuals?.length === 0 && <div className="empty-state"><div className="empty-state-text">কোন pending display manual নেই</div></div>}
          {data.pendingDisplayManuals?.map(dm => (
            <div key={dm._id} className="admin-item">
              <div className="admin-item-info">
                <div className="admin-item-title">{dm.title}</div>
                <div className="admin-item-meta">By: {dm.createdBy?.fullName} • Rows: {dm.rows?.length} • {new Date(dm.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="admin-actions">
                <button className="btn btn-sm btn-success" onClick={() => handleAction('display-manual', dm._id, 'approve')}>✓ Approve</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleAction('display-manual', dm._id, 'reject')}>✕ Reject</button>
                <button className="btn btn-sm btn-danger" onClick={() => { if(confirm('Delete?')) handleAction('display-manual', dm._id, 'delete'); }}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pending Images */}
      {tab === 'pending-images' && (
        <div>
          {data.metersWithPendingImages?.length === 0 && <div className="empty-state"><div className="empty-state-text">কোন pending image নেই</div></div>}
          {data.metersWithPendingImages?.map(meter => (
            <div key={meter._id} style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 10 }}>
                {meter.manufacturer} — {meter.item}
              </h3>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {meter.images?.filter(img => !img.approved).map((img, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <img src={img.url} alt="" style={{ width: 200, height: 150, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                    <div style={{ marginTop: 6, display: 'flex', gap: 4, justifyContent: 'center' }}>
                      <button className="btn btn-sm btn-success" onClick={() => handleAction('image', meter._id, 'approve', meter.images.indexOf(img))}>✓</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleAction('image', meter._id, 'delete', meter.images.indexOf(img))}>✕</button>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      By: {img.uploadedBy?.fullName}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All Meters */}
      {tab === 'all-meters' && (
        <div>
          {data.allMeters?.map(meter => (
            <div key={meter._id} className="admin-item">
              <div className="admin-item-info">
                <div className="admin-item-title">{meter.item} — {meter.manufacturer}</div>
                <div className="admin-item-meta">
                  {meter.types} • <span className={`status-badge status-${meter.status}`}>{meter.status}</span> • By: {meter.createdBy?.fullName}
                </div>
              </div>
              <div className="admin-actions">
                <a href={`/meters/${meter._id}`} className="btn btn-sm btn-secondary">View</a>
                <a href={`/meters/${meter._id}/edit`} className="btn btn-sm btn-secondary">Edit</a>
                {meter.status !== 'approved' && (
                  <button className="btn btn-sm btn-success" onClick={() => handleAction('meter', meter._id, 'approve')}>✓</button>
                )}
                <button className="btn btn-sm btn-danger" onClick={() => { if(confirm('Delete this meter and all related display manuals?')) handleAction('meter', meter._id, 'delete'); }}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All Display Manuals */}
      {tab === 'all-dm' && (
        <div>
          {data.allDisplayManuals?.map(dm => (
            <div key={dm._id} className="admin-item">
              <div className="admin-item-info">
                <div className="admin-item-title">{dm.title}</div>
                <div className="admin-item-meta">
                  <span className={`status-badge status-${dm.status}`}>{dm.status}</span> • By: {dm.createdBy?.fullName} • ❤️ {dm.likeCount || 0}
                </div>
              </div>
              <div className="admin-actions">
                {dm.status !== 'approved' && (
                  <button className="btn btn-sm btn-success" onClick={() => handleAction('display-manual', dm._id, 'approve')}>✓</button>
                )}
                <button className="btn btn-sm btn-danger" onClick={() => { if(confirm('Delete?')) handleAction('display-manual', dm._id, 'delete'); }}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
