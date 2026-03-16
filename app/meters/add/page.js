'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AddMeterPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    manufacturer: '', types: '', item: '', idNote: '',
    accuracyClass: '', errorClass: '', terminalPoint: '',
    warrantyPeriod: '',
    baseInfo: [''], standards: [''], workOrders: [''],
    manufacturerYears: [''], rateInfo: [''], demandInfo: [''],
    kvarInfo: [''], prepaidInfo: [''], networkInfo: [''], netMeterInfo: [''],
    serialRanges: [{ start: '', end: '' }],
    meterPrice: [{ mf: '', price: '' }],
  });

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/login'); }
      else setUser(d.user);
    });
  }, []);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, index, value) => {
    setForm(prev => {
      const arr = [...prev[field]];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  };

  const addArrayItem = (field) => {
    setForm(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayItem = (field, index) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleRangeChange = (index, key, value) => {
    setForm(prev => {
      const ranges = [...prev.serialRanges];
      ranges[index] = { ...ranges[index], [key]: value };
      return { ...prev, serialRanges: ranges };
    });
  };

  const handlePriceChange = (index, key, value) => {
    setForm(prev => {
      const prices = [...prev.meterPrice];
      prices[index] = { ...prices[index], [key]: value };
      return { ...prev, meterPrice: prices };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Clean up arrays - remove empty strings
      const cleanedForm = { ...form };
      ['baseInfo','standards','workOrders','manufacturerYears','rateInfo','demandInfo','kvarInfo','prepaidInfo','networkInfo','netMeterInfo'].forEach(f => {
        cleanedForm[f] = cleanedForm[f].filter(v => v.trim());
      });
      cleanedForm.serialRanges = cleanedForm.serialRanges.filter(r => r.start && r.end).map(r => ({ start: Number(r.start), end: Number(r.end) }));
      cleanedForm.meterPrice = cleanedForm.meterPrice.filter(p => p.mf || p.price).map(p => ({ mf: p.mf, price: Number(p.price) || 0 }));

      const res = await fetch('/api/meters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedForm)
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/meters/${data.meter._id}`);
      } else {
        setError(data.error || 'Failed to create meter');
      }
    } catch (e) {
      setError('Connection error');
    }
    setLoading(false);
  };

  if (!user) return <div className="loading"><div className="spinner"></div></div>;

  const arrayFields = [
    { key: 'baseInfo', label: 'Base Info' },
    { key: 'standards', label: 'Standards' },
    { key: 'workOrders', label: 'Work Orders' },
    { key: 'manufacturerYears', label: 'Manufacturer Years' },
    { key: 'rateInfo', label: 'Rate Info' },
    { key: 'demandInfo', label: 'Demand Info' },
    { key: 'kvarInfo', label: 'KVAR Info' },
    { key: 'prepaidInfo', label: 'Prepaid Info' },
    { key: 'networkInfo', label: 'Network Info' },
    { key: 'netMeterInfo', label: 'Net Meter Info' },
  ];

  return (
    <div className="form-page fade-in">
      <h1 className="form-title">➕ Add Meter Manual</h1>
      <p className="form-subtitle">নতুন মিটার ম্যানুয়াল যুক্ত করুন। Admin approval এর পর Public হবে।</p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div className="form-section">
          <h3 className="form-section-title">Basic Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Manufacturer *</label>
              <input className="form-input" required value={form.manufacturer} onChange={e => handleChange('manufacturer', e.target.value)} placeholder="e.g. Hexing" />
            </div>
            <div className="form-group">
              <label className="form-label">Type *</label>
              <input className="form-input" required value={form.types} onChange={e => handleChange('types', e.target.value)} placeholder="e.g. Single Phase" />
            </div>
            <div className="form-group">
              <label className="form-label">Item Code *</label>
              <input className="form-input" required value={form.item} onChange={e => handleChange('item', e.target.value)} placeholder="e.g. HXE-115" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">ID Note</label>
              <input className="form-input" value={form.idNote} onChange={e => handleChange('idNote', e.target.value)} placeholder="e.g. ID-2023-001" />
            </div>
            <div className="form-group">
              <label className="form-label">Accuracy Class</label>
              <input className="form-input" value={form.accuracyClass} onChange={e => handleChange('accuracyClass', e.target.value)} placeholder="e.g. Class 1" />
            </div>
            <div className="form-group">
              <label className="form-label">Error Class</label>
              <input className="form-input" value={form.errorClass} onChange={e => handleChange('errorClass', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Terminal Point</label>
              <input className="form-input" value={form.terminalPoint} onChange={e => handleChange('terminalPoint', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Warranty Period</label>
              <input className="form-input" value={form.warrantyPeriod} onChange={e => handleChange('warrantyPeriod', e.target.value)} placeholder="e.g. 5 Years" />
            </div>
          </div>
        </div>

        {/* Serial Ranges */}
        <div className="form-section">
          <h3 className="form-section-title">Serial Number Ranges</h3>
          {form.serialRanges.map((range, i) => (
            <div key={i} className="range-row">
              <input className="form-input" type="number" placeholder="Start (e.g. 500000)" value={range.start} onChange={e => handleRangeChange(i, 'start', e.target.value)} />
              <span style={{ color: 'var(--text-muted)' }}>—</span>
              <input className="form-input" type="number" placeholder="End (e.g. 800000)" value={range.end} onChange={e => handleRangeChange(i, 'end', e.target.value)} />
              {form.serialRanges.length > 1 && (
                <button type="button" className="btn btn-sm btn-danger" onClick={() => setForm(p => ({ ...p, serialRanges: p.serialRanges.filter((_, j) => j !== i) }))}>✕</button>
              )}
            </div>
          ))}
          <button type="button" className="btn btn-sm btn-secondary" onClick={() => setForm(p => ({ ...p, serialRanges: [...p.serialRanges, { start: '', end: '' }] }))}>
            + Add Range
          </button>
        </div>

        {/* Meter Price */}
        <div className="form-section">
          <h3 className="form-section-title">Meter Price</h3>
          {form.meterPrice.map((price, i) => (
            <div key={i} className="range-row">
              <input className="form-input" placeholder="MF/Source" value={price.mf} onChange={e => handlePriceChange(i, 'mf', e.target.value)} />
              <input className="form-input" type="number" placeholder="Price (৳)" value={price.price} onChange={e => handlePriceChange(i, 'price', e.target.value)} />
              {form.meterPrice.length > 1 && (
                <button type="button" className="btn btn-sm btn-danger" onClick={() => setForm(p => ({ ...p, meterPrice: p.meterPrice.filter((_, j) => j !== i) }))}>✕</button>
              )}
            </div>
          ))}
          <button type="button" className="btn btn-sm btn-secondary" onClick={() => setForm(p => ({ ...p, meterPrice: [...p.meterPrice, { mf: '', price: '' }] }))}>
            + Add Price
          </button>
        </div>

        {/* Array Fields */}
        <div className="form-section">
          <h3 className="form-section-title">Additional Information</h3>
          {arrayFields.map(({ key, label }) => (
            <div key={key} className="form-group">
              <label className="form-label">{label}</label>
              {form[key].map((val, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <input className="form-input" value={val} onChange={e => handleArrayChange(key, i, e.target.value)} placeholder={`${label} entry`} />
                  {form[key].length > 1 && (
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => removeArrayItem(key, i)}>✕</button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => addArrayItem(key)} style={{ marginTop: 4 }}>+ Add</button>
            </div>
          ))}
        </div>

        {/* Submit */}
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: 16, fontSize: '1rem' }}>
          {loading ? 'Submitting...' : '📤 Submit Meter Manual'}
        </button>
      </form>
    </div>
  );
}
