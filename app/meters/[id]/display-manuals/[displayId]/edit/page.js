'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function EditDisplayManualPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [authRes, dmRes] = await Promise.all([
          fetch('/api/auth/me').then(r => r.json()),
          fetch(`/api/display-manuals/${params.displayId}`).then(r => r.json())
        ]);

        if (!authRes.user) {
          router.push('/login');
          return;
        }
        setUser(authRes.user);

        if (dmRes.displayManual) {
          const dm = dmRes.displayManual;
          setTitle(dm.title || '');
          setRows(dm.rows || []);
        } else {
          setError('Display manual not found');
        }
      } catch (e) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.displayId, router]);

  const addRow = () => {
    setRows(prev => [...prev, {
      slNo: prev.length + 1, idNumber: '', display: '', unit: '',
      parameterName: '', parameterDetails: '', remarks: ''
    }]);
  };

  const removeRow = (index) => {
    setRows(prev => prev.filter((_, i) => i !== index).map((r, i) => ({ ...r, slNo: i + 1 })));
  };

  const updateRow = (index, field, value) => {
    setRows(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/display-manuals/${params.displayId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, rows })
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/meters/${params.id}`);
      } else {
        setError(data.error || 'Failed to update');
      }
    } catch (e) {
      setError('Connection error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="form-page fade-in">
      <h1 className="form-title">✏️ Edit Display Manual</h1>
      <p className="form-subtitle">পরিবর্তনের পর Admin approval প্রয়োজন হবে।</p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3 className="form-section-title">Display Manual Info</h3>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" required value={title} onChange={e => setTitle(e.target.value)} />
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Display Parameters Table</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="dm-table" style={{ marginBottom: 16 }}>
              <thead>
                <tr>
                  <th style={{ width: 60 }}>SL</th>
                  <th>ID Number</th>
                  <th>Display</th>
                  <th>Unit</th>
                  <th>Parameter Name</th>
                  <th>Parameter Details</th>
                  <th>Remarks</th>
                  <th style={{ width: 50 }}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td><input style={{ width: 50, padding: 6, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-primary)' }} type="number" value={row.slNo} onChange={e => updateRow(i, 'slNo', Number(e.target.value))} /></td>
                    <td><input style={{ width: '100%', padding: 6, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-primary)' }} value={row.idNumber} onChange={e => updateRow(i, 'idNumber', e.target.value)} /></td>
                    <td><input style={{ width: '100%', padding: 6, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-primary)' }} value={row.display} onChange={e => updateRow(i, 'display', e.target.value)} /></td>
                    <td><input style={{ width: '100%', padding: 6, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-primary)' }} value={row.unit} onChange={e => updateRow(i, 'unit', e.target.value)} /></td>
                    <td><input style={{ width: '100%', padding: 6, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-primary)' }} value={row.parameterName} onChange={e => updateRow(i, 'parameterName', e.target.value)} /></td>
                    <td><input style={{ width: '100%', padding: 6, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-primary)' }} value={row.parameterDetails} onChange={e => updateRow(i, 'parameterDetails', e.target.value)} /></td>
                    <td><input style={{ width: '100%', padding: 6, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-primary)' }} value={row.remarks} onChange={e => updateRow(i, 'remarks', e.target.value)} /></td>
                    <td>
                      {rows.length > 1 && (
                        <button type="button" className="btn btn-sm btn-danger" onClick={() => removeRow(i)} style={{ padding: '4px 8px' }}>✕</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="btn btn-secondary" onClick={addRow}>+ Add Row</button>
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: '100%', padding: 16 }}>
          {saving ? 'Saving...' : '💾 Save Changes'}
        </button>
      </form>
    </div>
  );
}
