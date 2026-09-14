import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  X, 
  Building2, 
  GraduationCap, 
  Home, 
  BookOpen, 
  Coffee, 
  Flag, 
  DoorOpen, 
  Compass, 
  Layers 
} from 'lucide-react';
import { UNIVERSITIES, getUniversityByTag } from '../../constants/universities';
import { CAMPUS_DATA } from '../../constants/campuses';

// Helper component to smoothly center map and invalidate dimensions
function ChangeMapView({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    const t1 = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch (_) {}
    }, 120);

    const t2 = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch (_) {}
    }, 400);

    if (center) {
      map.setView(center, zoom, { animate: true, duration: 0.8 });
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [center, zoom, map]);

  return null;
}

// Visual configurations per building category
const CATEGORY_STYLES = {
  hall: {
    bg: '#4f46e5', // indigo
    border: '#818cf8',
    icon: '🏠',
    label: 'Hall of Residence',
  },
  library: {
    bg: '#059669', // emerald
    border: '#34d399',
    icon: '📚',
    label: 'Central Library',
  },
  academic: {
    bg: '#0284c7', // sky
    border: '#38bdf8',
    icon: '🏛️',
    label: 'Academic Building / Faculty',
  },
  admin: {
    bg: '#334155', // slate
    border: '#94a3b8',
    icon: '🏢',
    label: 'Administrative Office',
  },
  facility: {
    bg: '#d97706', // amber
    border: '#fbbf24',
    icon: '☕',
    label: 'TSC / Cafeteria / Canteen',
  },
  monument: {
    bg: '#e11d48', // rose
    border: '#fb7185',
    icon: '🚩',
    label: 'Campus Monument / Landmark',
  },
  gate: {
    bg: '#0d9488', // teal
    border: '#2dd4bf',
    icon: '🚪',
    label: 'Campus Gate & Entrance',
  },
};

// Custom DivIcon for Campus Buildings
function createBuildingIcon(name, type) {
  const style = CATEGORY_STYLES[type] || CATEGORY_STYLES.academic;

  return L.divIcon({
    className: 'custom-building-pin',
    html: `
      <div style="
        display: flex;
        align-items: center;
        gap: 5px;
        background: ${style.bg};
        color: #ffffff;
        padding: 4px 9px;
        border-radius: 9999px;
        border: 2px solid #ffffff;
        box-shadow: 0 4px 14px rgba(0,0,0,0.35);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 11px;
        font-weight: 700;
        white-space: nowrap;
        transform: translate(-50%, -50%);
        pointer-events: auto;
        cursor: pointer;
        user-select: none;
      ">
        <span style="font-size:12px;line-height:1;">${style.icon}</span>
        <span style="letter-spacing: -0.2px;">${name}</span>
      </div>
    `,
    iconSize: [0, 0],
  });
}

export default function CampusMapModal({ isOpen, onClose, initialUniTag = 'RUET' }) {
  const [selectedTag, setSelectedTag] = useState(initialUniTag);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'hall' | 'academic' | 'library' | 'facility' | 'monument'

  // Prevent background body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const campus = CAMPUS_DATA[selectedTag] || CAMPUS_DATA.RUET;

  if (!isOpen) return null;

  // Filter landmarks by building category
  const allLandmarks = campus.landmarks || [];
  const filteredLandmarks = filterType === 'all'
    ? allLandmarks
    : allLandmarks.filter((lm) => lm.type === filterType);

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl h-[88vh] max-h-[800px] bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 border-b border-slate-200 dark:border-dark-800 flex items-center justify-between gap-4 bg-slate-50 dark:bg-dark-900 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-500/20 flex-shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg leading-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span>Interactive Campus Map</span>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-brand-500/15 text-brand-600 dark:text-brand-300">
                  {campus.tag}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Explore residential halls, faculty buildings, libraries, and major landmarks
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* University Selector Strip */}
        <div className="px-4 py-2.5 bg-slate-100/90 dark:bg-dark-800/80 border-b border-slate-200 dark:border-dark-800 flex items-center gap-2 overflow-x-auto scrollbar-none z-10">
          <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap uppercase">
            University:
          </span>
          {UNIVERSITIES.map((u) => {
            const active = selectedTag === u.tag;
            return (
              <button
                key={u.tag}
                onClick={() => {
                  setSelectedTag(u.tag);
                  setFilterType('all');
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white dark:bg-dark-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-700 border border-slate-200 dark:border-dark-700'
                }`}
              >
                {u.tag} • {u.city}
              </button>
            );
          })}
        </div>

        {/* Building Category Filter Pills */}
        <div className="px-4 py-2 bg-white dark:bg-dark-900 border-b border-slate-200/80 dark:border-dark-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none z-10 text-xs">
          <span className="text-[11px] font-mono font-bold text-slate-400 whitespace-nowrap mr-1">
            Filter:
          </span>
          {[
            { id: 'all', label: 'All Buildings', count: allLandmarks.length },
            { id: 'hall', label: '🏠 Halls of Residence', count: allLandmarks.filter(l => l.type === 'hall').length },
            { id: 'academic', label: '🏛️ Faculty & Academic', count: allLandmarks.filter(l => l.type === 'academic').length },
            { id: 'library', label: '📚 Central Library', count: allLandmarks.filter(l => l.type === 'library').length },
            { id: 'facility', label: '☕ TSC & Canteen', count: allLandmarks.filter(l => l.type === 'facility').length },
            { id: 'monument', label: '🚩 Shahid Minar / Landmarks', count: allLandmarks.filter(l => l.type === 'monument').length },
          ].map((cat) => {
            if (cat.id !== 'all' && cat.count === 0) return null;
            const active = filterType === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setFilterType(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  active
                    ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-300 border border-brand-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800'
                }`}
              >
                <span>{cat.label}</span>
                <span className="text-[10px] font-mono px-1 rounded bg-black/5 dark:bg-white/10">
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Leaflet Map Body */}
        <div className="relative flex-1 min-h-[420px] w-full overflow-hidden bg-slate-100 dark:bg-dark-card">
          <MapContainer
            center={campus.center}
            zoom={campus.zoom}
            scrollWheelZoom={true}
            keyboard={false}
            style={{ height: '100%', width: '100%', minHeight: '420px' }}
          >
            <ChangeMapView center={campus.center} zoom={campus.zoom} />

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Highlighted Major Buildings & Halls */}
            {filteredLandmarks.map((lm, idx) => {
              const meta = CATEGORY_STYLES[lm.type] || CATEGORY_STYLES.academic;
              return (
                <Marker
                  key={`${selectedTag}-lm-${idx}-${lm.name}`}
                  position={lm.coords}
                  icon={createBuildingIcon(lm.name, lm.type)}
                >
                  <Popup>
                    <div className="p-1 font-sans min-w-[200px]">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-base">{meta.icon}</span>
                        <div className="font-bold text-xs text-slate-900 leading-tight">
                          {lm.name}
                        </div>
                      </div>
                      <div className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white mb-1" style={{ background: meta.bg }}>
                        {meta.label}
                      </div>
                      <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 mt-1">
                        {campus.name}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Map Building Type Legend */}
          <div className="absolute bottom-4 left-4 z-[400] bg-white/95 dark:bg-dark-900/95 border border-slate-200 dark:border-dark-800 rounded-xl p-3 shadow-xl backdrop-blur-sm text-xs space-y-1.5 hidden sm:block">
            <div className="font-bold text-slate-800 dark:text-slate-200 text-[11px] mb-1">
              Building Color Legend
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <span>🏠 Residential Halls</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
              <span>🏛️ Faculty &amp; Academic</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>📚 Central Library</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
              <span>☕ TSC / Cafeteria / Canteen</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
              <span>🚩 Shahid Minar &amp; Monuments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
