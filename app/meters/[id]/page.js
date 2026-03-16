'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function MeterDetailPage() {
  const params = useParams();
  const [meter, setMeter] = useState(null);
  const [displayManuals, setDisplayManuals] = useState([]);
  const [showAllDMs, setShowAllDMs] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [urls, setUrls] = useState({ publicUrl: '', jsonUrl: '' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadData();
    // Set URLs only on client to avoid hydration mismatch
    const base = window.location.origin;
    setUrls({
      publicUrl: `${base}/meters/${params.id}`,
      jsonUrl: `${base}/api/meters/${params.id}/json`
    });
  }, []);

  const loadData = async () => {
    try {
      const [meterRes, dmRes, authRes] = await Promise.all([
        fetch(`/api/meters/${params.id}`),
        fetch(`/api/display-manuals?meterId=${params.id}`),
        fetch('/api/auth/me')
      ]);

      const meterData = await meterRes.json();
      const dmData = await dmRes.json();
      const authData = await authRes.json();

      setMeter(meterData.meter);
      setDisplayManuals(dmData.displayManuals || []);
      setUser(authData.user);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleLike = async (dmId) => {
    if (!user) {
      alert('Please login to like');
      return;
    }
    try {
      const res = await fetch(`/api/display-manuals/${dmId}/like`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setDisplayManuals(prev =>
          prev.map(dm => dm._id === dmId ? { ...dm, likeCount: data.likeCount, likes: data.liked ? [...(dm.likes||[]), user.username] : (dm.likes||[]).filter(l => l !== user.username) } : dm)
        );
      }
    } catch (e) {}
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`/api/meters/${params.id}/images`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Image uploaded! Pending admin approval.');
        loadData();
      } else {
        setMessage('Upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (e) {
      setMessage('Upload error');
    }
    setUploading(false);
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (!meter) {
    return <div className="empty-state"><div className="empty-state-icon">❌</div><div className="empty-state-text">Meter not found</div></div>;
  }

  const { publicUrl, jsonUrl } = urls;
  const approvedImages = meter.images?.filter(img => img.approved) || [];
  const visibleDMs = showAllDMs ? displayManuals : displayManuals.slice(0, 2);

  const specFields = [
    { label: 'Manufacturer', value: meter.manufacturer },
    { label: 'Type', value: meter.types },
    { label: 'Item', value: meter.item },
    { label: 'ID Note', value: meter.idNote },
    { label: 'Accuracy Class', value: meter.accuracyClass },
    { label: 'Error Class', value: meter.errorClass },
    { label: 'Terminal Point', value: meter.terminalPoint },
    { label: 'Warranty Period', value: meter.warrantyPeriod },
  ];

  const listFields = [
    { label: 'Base Info', value: meter.baseInfo },
    { label: 'Standards', value: meter.standards },
    { label: 'Work Orders', value: meter.workOrders },
    { label: 'Manufacturer Years', value: meter.manufacturerYears },
    { label: 'Rate Info', value: meter.rateInfo },
    { label: 'Demand Info', value: meter.demandInfo },
    { label: 'KVAR Info', value: meter.kvarInfo },
    { label: 'Prepaid Info', value: meter.prepaidInfo },
    { label: 'Network Info', value: meter.networkInfo },
    { label: 'Net Meter Info', value: meter.netMeterInfo },
  ];

  return (
    <div className="page-container fade-in">
      {/* Status Badge */}
      {meter.status !== 'approved' && (
        <div className="alert alert-info" style={{ marginBottom: 20 }}>
          Status: <span className={`status-badge status-${meter.status}`}>{meter.status}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
          {meter.manufacturer}
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '4px 0' }}>{meter.item}</h1>
        <div style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>{meter.types}</div>

        {/* Public Links */}
        <div className="public-links" style={{ marginTop: 14 }}>
          <a href={publicUrl} className="public-link" target="_blank">🔗 Public URL</a>
          <a href={jsonUrl} className="public-link" target="_blank">📋 JSON API</a>
          {user && (user.username === meter.createdBy?.username || user.isAdmin) && (
            <a href={`/meters/${meter._id}/edit`} className="btn btn-sm btn-secondary">✏️ Edit</a>
          )}
        </div>
      </div>

      {/* Serial Ranges */}
      {meter.serialRanges?.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="spec-label">Serial Number Ranges</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {meter.serialRanges.map((range, i) => (
              <span key={i} className="serial-badge" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                {mounted ? range.start?.toLocaleString() : range.start} — {mounted ? range.end?.toLocaleString() : range.end}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Specification Grid */}
      <div className="section-header">
        <h2 className="section-title">📋 Specifications</h2>
      </div>
      <div className="spec-grid" style={{ marginBottom: 30 }}>
        {specFields.map(({ label, value }) => value ? (
          <div key={label} className="spec-item">
            <div className="spec-label">{label}</div>
            <div className="spec-value">{value}</div>
          </div>
        ) : null)}

        {/* Price Info */}
        {meter.meterPrice?.length > 0 && (
          <div className="spec-item">
            <div className="spec-label">Meter Price</div>
            <ul className="spec-value-list">
              {meter.meterPrice.map((p, i) => (
                <li key={i}>{p.mf}: ৳{p.price?.toLocaleString()}</li>
              ))}
            </ul>
          </div>
        )}

        {/* List Fields */}
        {listFields.map(({ label, value }) => value?.length > 0 ? (
          <div key={label} className="spec-item">
            <div className="spec-label">{label}</div>
            <ul className="spec-value-list">
              {value.map((v, i) => <li key={i}>{v}</li>)}
            </ul>
          </div>
        ) : null)}
      </div>

      {/* Contributors */}
      {meter.contributors?.length > 0 && (
        <>
          <div className="section-header">
            <h2 className="section-title">👥 Contributors</h2>
          </div>
          <div className="contributor-list" style={{ marginBottom: 30 }}>
            {meter.contributors.map((c, i) => (
              <div key={i} className="contributor-card">
                {c.profilePic ? (
                  <img src={c.profilePic} alt="" className="profile-pic" />
                ) : (
                  <div className="profile-pic-placeholder">{c.fullName?.[0] || '?'}</div>
                )}
                <div className="contributor-info">
                  <span className="contributor-name">{c.fullName}</span>
                  <span className="contributor-detail">{c.pbsName} • {c.contribution}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Display Manuals */}
      <div className="section-header">
        <h2 className="section-title">📊 Display Manuals</h2>
        {user && (
          <a href={`/meters/${meter._id}/display-manuals/add`} className="btn btn-sm btn-primary">
            ➕ Add Display Manual
          </a>
        )}
      </div>

      {visibleDMs.length === 0 && (
        <div className="empty-state" style={{ padding: '30px' }}>
          <div className="empty-state-text">কোন Display Manual নেই</div>
        </div>
      )}

      {visibleDMs.map(dm => (
        <div key={dm._id} style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{dm.title}</h3>
              {dm.status !== 'approved' && (
                <span className={`status-badge status-${dm.status}`} style={{ marginLeft: 8 }}>{dm.status}</span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {user && (user.username === dm.createdBy?.username || user.isAdmin) && (
                <a href={`/meters/${params.id}/display-manuals/${dm._id}/edit`} className="btn btn-sm btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                  ✏️ Edit
                </a>
              )}
              <button
                className={`like-btn ${user && dm.likes?.includes(user.username) ? 'liked' : ''}`}
                onClick={() => handleLike(dm._id)}
                disabled={!user}
              >
                ❤️ {dm.likeCount || 0}
              </button>
            </div>
          </div>

          <div className="dm-table-wrapper">
            <table className="dm-table">
              <thead>
                <tr>
                  <th>SL No</th>
                  <th>ID Number</th>
                  <th>Display</th>
                  <th>Unit</th>
                  <th>Parameter Name</th>
                  <th>Parameter Details</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {dm.rows?.map((row, i) => (
                  <tr key={i}>
                    <td>{row.slNo}</td>
                    <td>{row.idNumber}</td>
                    <td>{row.display}</td>
                    <td>{row.unit}</td>
                    <td>{row.parameterName}</td>
                    <td>{row.parameterDetails}</td>
                    <td>{row.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Creator Profile */}
          <div className="profile-chip">
            {dm.createdBy?.profilePic ? (
              <img src={dm.createdBy.profilePic} alt="" className="profile-pic" />
            ) : (
              <div className="profile-pic-placeholder">
                {dm.createdBy?.fullName?.[0] || '?'}
              </div>
            )}
            <div>
              <div className="profile-name">{dm.createdBy?.fullName}</div>
              <div className="profile-pbs">{dm.createdBy?.pbsName}</div>
            </div>
          </div>
        </div>
      ))}

      {displayManuals.length > 2 && !showAllDMs && (
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <button className="btn btn-secondary" onClick={() => setShowAllDMs(true)}>
            আরো দেখুন ({displayManuals.length - 2} more)
          </button>
        </div>
      )}

      {/* Image Gallery */}
      <div className="section-header" style={{ marginTop: 20 }}>
        <h2 className="section-title">🖼️ Images</h2>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      {approvedImages.length > 0 ? (
        <div className="image-gallery" style={{ marginBottom: 20 }}>
          {approvedImages.map((img, i) => (
            <img key={i} src={img.url} alt={`Meter image ${i + 1}`} className="gallery-img" />
          ))}
        </div>
      ) : (
        <div className="empty-state" style={{ padding: '20px' }}>
          <div className="empty-state-text">কোন ছবি নেই</div>
        </div>
      )}

      {/* Upload Image */}
      <div style={{ marginTop: 10, marginBottom: 40 }}>
        <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
          📷 {uploading ? 'Uploading...' : 'Upload Image'}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
            disabled={uploading}
          />
        </label>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 10 }}>
          Admin approval required
        </span>
      </div>
    </div>
  );
}
