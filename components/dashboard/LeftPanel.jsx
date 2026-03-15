// components/dashboard/LeftPanel.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, ChevronRight, Thermometer, Zap, Droplets } from 'lucide-react';
import { BUILDINGS, ROOMS, getRoomStatus } from '@/lib/sensorData';
import { useState } from 'react';

const STATUS_COLORS = {
  green: '#00ff94',
  red:   '#ff3d5a',
  amber: '#fbbf24',
  blue:  '#3b82f6',
};

const STATUS_LABELS = {
  green: 'EMPTY',
  red:   'OCCUPIED',
  amber: 'HIGH PWR',
  blue:  'LEAK',
};

function MiniRoomRow({ room, sensors, onSelect, selected }) {
  const status = getRoomStatus(sensors, room.id);
  const d      = sensors[room.id] || {};
  const color  = STATUS_COLORS[status];

  return (
    <motion.div
      className="flex items-center gap-2 px-3 py-2 rounded cursor-pointer border-animated"
      style={{
        background: selected === room.id ? `${color}10` : 'transparent',
        border: `1px solid ${selected === room.id ? `${color}40` : 'transparent'}`,
      }}
      onClick={() => onSelect(room.id)}
      whileHover={{ x: 4, background: `${color}08` }}
      transition={{ duration: 0.15 }}
    >
      <motion.div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: color }}
        animate={{ opacity: [1, 0.4, 1], scale: [1, 1.2, 1] }}
        transition={{ duration: status === 'red' ? 1.2 : 2.5, repeat: Infinity }}
      />
      <span className="font-mono text-xs flex-1" style={{ color: 'var(--text-primary)', fontSize: '11px' }}>
        {room.id}
      </span>
      <span className="font-mono" style={{ color, fontSize: '9px', letterSpacing: '0.05em' }}>
        {STATUS_LABELS[status]}
      </span>
      <span className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>
        {d.occupancy ?? '—'}/{room.cap}
      </span>
    </motion.div>
  );
}

function BuildingCard({ building, sensors, onSelect, selected, bootDelay }) {
  const [open, setOpen] = useState(true);
  const rooms   = ROOMS.filter(r => r.building === building.id);
  const floors  = [...new Set(rooms.map(r => r.floor))].sort();
  const totE    = rooms.reduce((s, r) => s + (sensors[r.id]?.energy || 0), 0);
  const totOcc  = rooms.reduce((s, r) => s + (sensors[r.id]?.occupancy || 0), 0);
  const hasLeak = rooms.some(r => sensors[r.id]?.waterFlow === 'LEAK');
  const alerts  = rooms.filter(r => getRoomStatus(sensors, r.id) !== 'green').length;

  return (
    <motion.div
      className="rounded-xl overflow-hidden mb-3"
      style={{ border: `1px solid ${building.color}25`, background: `${building.color}05` }}
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: bootDelay, duration: 0.5 }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer"
        style={{ borderBottom: `1px solid ${building.color}20` }}
        onClick={() => setOpen(o => !o)}
      >
        <Building2 size={14} style={{ color: building.color, flexShrink: 0 }} />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-xs tracking-wider" style={{ color: building.color }}>{building.name}</div>
          <div className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>
            BLOCK {building.id} · {rooms.length} ROOMS
          </div>
        </div>
        <div className="flex items-center gap-2">
          {alerts > 0 && (
            <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,61,90,0.15)', color: '#ff3d5a', fontSize: '10px' }}>
              {alerts}
            </span>
          )}
          <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight size={12} style={{ color: 'var(--text-secondary)' }} />
          </motion.div>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-0 px-3 py-2" style={{ borderBottom: `1px solid ${building.color}15` }}>
        <div className="flex items-center gap-1 flex-1">
          <Zap size={10} style={{ color: '#fbbf24' }} />
          <span className="font-mono" style={{ color: '#fbbf24', fontSize: '10px' }}>{totE.toFixed(1)}kW</span>
        </div>
        <div className="flex items-center gap-1 flex-1">
          <Building2 size={10} style={{ color: building.color }} />
          <span className="font-mono" style={{ color: building.color, fontSize: '10px' }}>{totOcc} ppl</span>
        </div>
        {hasLeak && (
          <div className="flex items-center gap-1">
            <Droplets size={10} style={{ color: '#3b82f6' }} className="flicker" />
            <span className="font-mono" style={{ color: '#3b82f6', fontSize: '10px' }}>LEAK</span>
          </div>
        )}
      </div>

      {/* Room list */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-1 py-1">
              {floors.map(floor => (
                <div key={floor} className="mb-1">
                  <div className="px-2 py-1" style={{ color: 'var(--text-muted)', fontSize: '9px', letterSpacing: '0.12em' }}>
                    FL {floor}
                  </div>
                  {rooms.filter(r => r.floor === floor).map(room => (
                    <MiniRoomRow
                      key={room.id}
                      room={room}
                      sensors={sensors}
                      onSelect={onSelect}
                      selected={selected}
                    />
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function LeftPanel({ sensors, selectedRoom, onSelectRoom }) {
  const totalE   = ROOMS.reduce((s, r) => s + (sensors[r.id]?.energy || 0), 0);
  const avgTemp  = (ROOMS.reduce((s, r) => s + (sensors[r.id]?.temperature || 0), 0) / ROOMS.length).toFixed(1);

  return (
    <motion.aside
      className="flex flex-col h-full glass-bright"
      style={{ width: '240px', borderRight: '1px solid var(--border)', flexShrink: 0 }}
      initial={{ x: -240 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Section header */}
      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="font-mono text-xs tracking-widest" style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>
          CAMPUS OVERVIEW
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1.5">
            <Zap size={11} style={{ color: '#00d4ff' }} />
            <span className="font-mono font-bold" style={{ color: '#00d4ff', fontSize: '13px' }}>{totalE.toFixed(1)}<span className="text-xs font-normal ml-0.5" style={{ color: 'var(--text-secondary)' }}>kW</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Thermometer size={11} style={{ color: '#f97316' }} />
            <span className="font-mono font-bold" style={{ color: '#f97316', fontSize: '13px' }}>{avgTemp}<span className="text-xs font-normal ml-0.5" style={{ color: 'var(--text-secondary)' }}>°C</span></span>
          </div>
        </div>
      </div>

      {/* Buildings */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {BUILDINGS.map((b, i) => (
          <BuildingCard
            key={b.id}
            building={b}
            sensors={sensors}
            onSelect={onSelectRoom}
            selected={selectedRoom}
            bootDelay={0.3 + i * 0.15}
          />
        ))}
      </div>

      {/* Bottom status */}
      <div className="px-3 py-3" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '9px', letterSpacing: '0.1em' }}>SENSOR NODES</span>
          <span className="font-mono" style={{ color: '#00ff94', fontSize: '10px' }}>{ROOMS.length}/10 ONLINE</span>
        </div>
        <div className="flex gap-1">
          {ROOMS.map(r => {
            const status = getRoomStatus(sensors, r.id);
            const color  = STATUS_COLORS[status];
            return (
              <motion.div
                key={r.id}
                className="flex-1 h-1 rounded-full"
                style={{ background: color, opacity: 0.7 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, delay: Math.random() * 2, repeat: Infinity }}
              />
            );
          })}
        </div>
      </div>
    </motion.aside>
  );
}
