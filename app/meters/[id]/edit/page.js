'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function EditMeterPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch(`/api/meters/${params.id}`).then(r => r.json())
    ]).then(([authData, meterData]) => {
      if (!authData.user) { router.push('/login'); return; }
      setUser(authData.user);
      if (meterData.meter) {
        const m = meterData.meter;
        setForm({
          manufacturer: m.manufacturer || '', types: m.types || '', item: m.item || '',
          idNote: m.idNote || '', accuracyClass: m.accuracyClass || '', errorClass: m.errorClass || '',
          terminalPoint: m.terminalPoint || '', warrantyPeriod: m.warrantyPeriod || '',
          baseInfo: m.baseInfo?.length ? m.baseInfo : [''],
          standards: m.standards?.length ? m.standards : [''],
          workOrders: m.workOrders?.length ? m.workOrders : [''],
          manufacturerYears: m.manufacturerYears?.length ? m.manufacturerYears : [''],
          rateInfo: m.rateInfo?.length ? m.rateInfo : [''],
          demandInfo: m.demandInfo?.length ? m.demandInfo : [''],
          kvarInfo: m.kvarInfo?.length ? m.kvarInfo : [''],
          prepaidInfo: m.prepaidInfo?.length ? m.prepaidInfo : [''],
          networkInfo: m.networkInfo?.length ? m.networkInfo : [''],
          netMeterInfo: m.netMeterInfo?.length ? m.netMeterInfo : [''],
          serialRanges: m.serialRanges?.length ? m.serialRanges.map(r => ({ start: r.start?.toString() || '', end: r.end?.toString() || '' })) : [{ start: '', end: '' }],
          meterPrice: m.meterPrice?.length ? m.meterPrice.map(p => ({ mf: p.mf || '', price: p.price?.toString() || '' })) : [{ mf: '', price: '' }],
        });
      }
      setLoading(false);
    });
  }, []);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleArrayChange = (field, index, value) => {
    setForm(prev => { const arr = [...prev[field]]; arr[index] = value; return { ...prev, [field]: arr }; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      const cleanedForm = { ...form };
      ['baseInfo','standards','workOrders','manufacturerYears','rateInfo','demandInfo','kvarInfo','prepaidInfo','networkInfo','netMeterInfo'].forEach(f => {
        cleanedForm[f] = cleanedForm[f].filter(v => v.trim());
      });
      cleanedForm.serialRanges = cleanedForm.serialRanges.filter(r => r.start && r.end).map(r => ({ start: Number(r.start), end: Number(r.end) }));
      cleanedForm.meterPrice = cleanedForm.meterPrice.filter(p => p.mf || p.price).map(p => ({ mf: p.mf, price: Number(p.price) || 0 }));

      const res = await fetch(`/api/meters/${params.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedForm)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Updated successfully! Pending admin approval.');
      } else { setError(data.error || 'Failed'); }
    } catch (e) { setError('Connection error'); }
    setSaving(false);
  };

  if (loading || !form) return <div className="loading"><div className="spinner"></div></div>;

  const arrayFields = [
    { key: 'baseInfo', label: 'Base Info' }, { key: 'standards', label: 'Standards' },
    { key: 'workOrders', label: 'Work Orders' }, { key: 'manufacturerYears', label: 'Manufacturer Years' },
    { key: 'rateInfo', label: 'Rate Info' }, { key: 'demandInfo', label: 'Demand Info' },
    { key: 'kvarInfo', label: 'KVAR Info' }, { key: 'prepaidInfo', label: 'Prepaid Info' },
    { key: 'networkInfo', label: 'Network Info' }, { key: 'netMeterInfo', label: 'Net Meter Info' },
  ];

  return (
    <div className="form-page fade-in">
      <h1 className="form-title">✏️ Edit Meter Manual</h1>
      <p className="form-subtitle">পরিবর্তনের পর Admin approval প্রয়োজন হবে।</p>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3 className="form-section-title">Basic Information</h3>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Manufacturer *</label><input className="form-input" required value={form.manufacturer} onChange={e => handleChange('manufacturer', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Type *</label><input className="form-input" required value={form.types} onChange={e => handleChange('types', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Item Code *</label><input className="form-input" required value={form.item} onChange={e => handleChange('item', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">ID Note</label><input className="form-input" value={form.idNote} onChange={e => handleChange('idNote', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Accuracy Class</label><input className="form-input" value={form.accuracyClass} onChange={e => handleChange('accuracyClass', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Error Class</label><input className="form-input" value={form.errorClass} onChange={e => handleChange('errorClass', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Terminal Point</label><input className="form-input" value={form.terminalPoint} onChange={e => handleChange('terminalPoint', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Warranty Period</label><input className="form-input" value={form.warrantyPeriod} onChange={e => handleChange('warrantyPeriod', e.target.value)} /></div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Serial Number Ranges</h3>
          {form.serialRanges.map((range, i) => (
            <div key={i} className="range-row">
              <input className="form-input" type="number" placeholder="Start" value={range.start} onChange={e => { const r = [...form.serialRanges]; r[i] = { ...r[i], start: e.target.value }; setForm(p => ({ ...p, serialRanges: r })); }} />
              <span style={{ color: 'var(--text-muted)' }}>—</span>
              <input className="form-input" type="number" placeholder="End" value={range.end} onChange={e => { const r = [...form.serialRanges]; r[i] = { ...r[i], end: e.target.value }; setForm(p => ({ ...p, serialRanges: r })); }} />
              {form.serialRanges.length > 1 && <button type="button" className="btn btn-sm btn-danger" onClick={() => setForm(p => ({ ...p, serialRanges: p.serialRanges.filter((_, j) => j !== i) }))}>✕</button>}
            </div>
          ))}
          <button type="button" className="btn btn-sm btn-secondary" onClick={() => setForm(p => ({ ...p, serialRanges: [...p.serialRanges, { start: '', end: '' }] }))}>+ Add Range</button>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Meter Price</h3>
          {form.meterPrice.map((price, i) => (
            <div key={i} className="range-row">
              <input className="form-input" placeholder="MF/Source" value={price.mf} onChange={e => { const p = [...form.meterPrice]; p[i] = { ...p[i], mf: e.target.value }; setForm(prev => ({ ...prev, meterPrice: p })); }} />
              <input className="form-input" type="number" placeholder="Price (৳)" value={price.price} onChange={e => { const p = [...form.meterPrice]; p[i] = { ...p[i], price: e.target.value }; setForm(prev => ({ ...prev, meterPrice: p })); }} />
              {form.meterPrice.length > 1 && <button type="button" className="btn btn-sm btn-danger" onClick={() => setForm(p => ({ ...p, meterPrice: p.meterPrice.filter((_, j) => j !== i) }))}>✕</button>}
            </div>
          ))}
          <button type="button" className="btn btn-sm btn-secondary" onClick={() => setForm(p => ({ ...p, meterPrice: [...p.meterPrice, { mf: '', price: '' }] }))}>+ Add Price</button>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Additional Information</h3>
          {arrayFields.map(({ key, label }) => (
            <div key={key} className="form-group">
              <label className="form-label">{label}</label>
              {form[key].map((val, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <input className="form-input" value={val} onChange={e => handleArrayChange(key, i, e.target.value)} />
                  {form[key].length > 1 && <button type="button" className="btn btn-sm btn-danger" onClick={() => setForm(p => ({ ...p, [key]: p[key].filter((_, j) => j !== i) }))}>✕</button>}
                </div>
              ))}
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => setForm(p => ({ ...p, [key]: [...p[key], ''] }))}>+ Add</button>
            </div>
          ))}
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: '100%', padding: 16, fontSize: '1rem' }}>
          {saving ? 'Saving...' : '💾 Save Changes'}
        </button>
      </form>
    </div>
  );
}
