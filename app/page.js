'use client';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [meters, setMeters] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const search = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (selectedManufacturer) params.set('manufacturer', selectedManufacturer);
      if (selectedItem) params.set('item', selectedItem);
      
      const res = await fetch(`/api/meters?${params}`);
      const data = await res.json();
      setMeters(data.meters || []);
      if (data.filters) {
        setManufacturers(data.filters.manufacturers || []);
        setItems(data.filters.items || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  // Load filters on mount
  useEffect(() => {
    fetch('/api/meters?limit=0')
      .then(r => r.json())
      .then(data => {
        if (data.filters) {
          setManufacturers(data.filters.manufacturers || []);
          setItems(data.filters.items || []);
        }
      })
      .catch(() => {});
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') search();
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">Meter Manual DataHub</h1>
        <p className="hero-subtitle">
          সমস্ত মিটারের Manual, Specification ও Display Parameter এর তথ্য এক জায়গায়। মিটার নম্বর দিয়ে সার্চ করুন।
        </p>
        
        {/* Search Bar */}
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="মিটার নম্বর, Manufacturer, Item Code দিয়ে সার্চ করুন..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            id="search-input"
          />
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <select
            className="filter-select"
            value={selectedManufacturer}
            onChange={(e) => setSelectedManufacturer(e.target.value)}
            id="filter-manufacturer"
          >
            <option value="">All Manufacturers</option>
            {manufacturers.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            id="filter-item"
          >
            <option value="">All Items</option>
            {items.map(i => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>

          <button className="btn btn-primary" onClick={search} id="search-btn">
            Search
          </button>
        </div>
      </section>

      {/* Results */}
      <div className="page-container">
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        )}

        {!loading && searched && meters.length === 0 && (
          <div className="empty-state fade-in">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-text">কোন মিটার পাওয়া যায়নি</div>
          </div>
        )}

        {!loading && meters.length > 0 && (
          <div className="meter-grid">
            {meters.map(meter => (
              <a
                key={meter._id}
                href={`/meters/${meter._id}`}
                className="meter-card"
              >
                <div className="meter-card-manufacturer">{meter.manufacturer}</div>
                <div className="meter-card-item">{meter.item}</div>
                <div className="meter-card-type">{meter.types}</div>
                {meter.idNote && (
                  <div className="meter-card-note">{meter.idNote}</div>
                )}
                {meter.serialRanges && meter.serialRanges.length > 0 && (
                  <div className="meter-card-serials">
                    {meter.serialRanges.map((range, i) => (
                      <span key={i} className="serial-badge">
                        {mounted ? range.start.toLocaleString() : range.start} - {mounted ? range.end.toLocaleString() : range.end}
                      </span>
                    ))}
                  </div>
                )}
              </a>
            ))}
          </div>
        )}

        {!searched && !loading && (
          <div className="empty-state fade-in">
            <div className="empty-state-icon">⚡</div>
            <div className="empty-state-text">উপরে সার্চ করে মিটারের তথ্য খুঁজুন</div>
          </div>
        )}
      </div>
    </div>
  );
}
