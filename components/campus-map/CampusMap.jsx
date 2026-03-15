// components/campus-map/CampusMap.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { BUILDINGS, ROOMS, getRoomStatus } from '@/lib/sensorData';
import { X, Zap, Users, Thermometer, Droplets, Wind } from 'lucide-react';

const STATUS_COLORS = {
  green: '#00ff94',
  red:   '#ff3d5a',
  amber: '#fbbf24',
  blue:  '#3b82f6',
};

const STATUS_BG = {
  green: 'rgba(0,255,148,0.08)',
  red:   'rgba(255,61,90,0.1)',
  amber: 'rgba(251,191,36,0.09)',
  blue:  'rgba(59,130,246,0.1)',
};

const CLASS_MAP = {
  green: 'room-green',
  red:   'room-red',
  amber: 'room-amber',
  blue:  'room-blue',
};

function RoomTooltip({ room, sensors, onClose }) {
  const d   = sensors[room.id] || {};
  const st  = getRoomStatus(sensors, room.id);
  const col = STATUS_COLORS[st];
  const occ = Math.round((d.occupancy || 0) / room.cap * 100);

  return (
    <motion.div
      className="absolute z-50 rounded-xl glass-bright hud-corner"
      style={{ top: -10, left: '105%', width: 220, border: `1px solid ${col}50` }}
      initial={{ opacity: 0, scale: 0.85, x: -10 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.85, x: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="font-bold tracking-widest font-orbitron" style={{ color: col, fontSize: '13px' }}>{room.id}</div>
            <div className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>{room.name}</div>
          </div>
          <button onClick={onClose} className="p-0.5 rounded" style={{ color: 'var(--text-muted)' }}>
            <X size={12} />
          </button>
        </div>

        {/* Occupancy bar */}
        <div className="mb-2">
          <div className="flex justify-between mb-1">
            <span className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>OCCUPANCY</span>
            <span className="font-mono font-bold" style={{ color: col, fontSize: '10px' }}>{d.occupancy}/{room.cap}</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: 'var(--bg-elevated)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: col }}
              initial={{ width: 0 }}
              animate={{ width: `${occ}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { icon: Zap,         label: 'Energy',  val: `${d.energy}kW`,     color: d.energy > 5 ? '#fbbf24' : '#6b90b0' },
            { icon: Thermometer, label: 'Temp',    val: `${d.temperature}°C`, color: d.temperature > 28 ? '#f97316' : '#6b90b0' },
            { icon: Wind,        label: 'CO₂',     val: `${d.co2}ppm`,        color: d.co2 > 900 ? '#fbbf24' : '#6b90b0' },
            { icon: Droplets,    label: 'Water',   val: d.waterFlow,           color: d.waterFlow === 'LEAK' ? '#3b82f6' : '#00ff94' },
          ].map(({ icon: Icon, label, val, color }) => (
            <div key={label} className="flex items-center gap-1.5 px-2 py-1.5 rounded" style={{ background: 'var(--bg-elevated)' }}>
              <Icon size={10} style={{ color, flexShrink: 0 }} />
              <div>
                <div className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '8px', lineHeight: 1 }}>{label}</div>
                <div className="font-mono font-bold" style={{ color, fontSize: '10px', lineHeight: 1.4 }}>{val}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: d.ac ? '#00d4ff' : 'var(--text-muted)' }} />
          <span className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: '9px' }}>AC {d.ac ? 'ACTIVE' : 'OFF'}</span>
          <div className="w-1.5 h-1.5 rounded-full ml-2" style={{ background: d.occupancy > 0 ? col : 'var(--text-muted)' }} />
          <span className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: '9px' }}>{d.occupancy > 0 ? 'OCCUPIED' : 'EMPTY'}</span>
        </div>
      </div>
    </motion.div>
  );
}

function FloorMap({ building, floor, rooms, sensors, selectedRoom, onSelect }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="relative" style={{ height: '80px' }}>
      <div className="absolute left-0 top-0 h-full flex items-center" style={{ width: '32px' }}>
        <span className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '9px', writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: '0.1em' }}>FL {floor}</span>
      </div>
      <div className="absolute left-8 right-0 top-0 bottom-0 rounded-lg" style={{ border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.2)' }}>
        {rooms.map(room => {
          const status = getRoomStatus(sensors, room.id);
          const color  = STATUS_COLORS[status];
          const isSelected = selectedRoom === room.id;

          return (
            <div
              key={room.id}
              className={`absolute cursor-pointer rounded-md transition-all ${CLASS_MAP[status]}`}
              style={{
                left:   `${room.x}%`,
                top:    `${room.y}%`,
                width:  `${room.w}%`,
                height: `${room.h}%`,
                background: isSelected ? `${color}22` : STATUS_BG[status],
                border: `1px solid ${isSelected ? color : `${color}50`}`,
                zIndex: isSelected || hovered === room.id ? 20 : 1,
              }}
              onClick={() => onSelect(isSelected ? null : room.id)}
              onMouseEnter={() => setHovered(room.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-0.5">
                <span className="font-mono font-bold text-center leading-tight" style={{ color, fontSize: '9px' }}>{room.id}</span>
                <span className="font-mono text-center leading-tight" style={{ color: 'var(--text-secondary)', fontSize: '8px' }}>
                  {(sensors[room.id]?.occupancy ?? 0)}/{room.cap}
                </span>
              </div>

              {/* Tooltip */}
              <AnimatePresence>
                {(hovered === room.id || isSelected) && (
                  <RoomTooltip room={room} sensors={sensors} onClose={() => onSelect(null)} />
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CampusMap({ sensors, selectedRoom, onSelectRoom, booting }) {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ position: 'relative' }}>
      {/* Grid bg */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,212,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.05) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Boot overlay */}
      <AnimatePresence>
        {booting && (
          <motion.div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: 'var(--bg-deep)' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="font-orbitron text-2xl font-bold text-glow-cyan mb-4"
              style={{ color: 'var(--cyan)' }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              INITIALIZING DIGITAL TWIN
            </motion.div>
            <div className="flex gap-2">
              {['SENSORS', 'NETWORK', 'AI ENGINE', 'MAP'].map((txt, i) => (
                <motion.div
                  key={txt}
                  className="font-mono px-3 py-1 rounded"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '11px' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, borderColor: 'rgba(0,212,255,0.4)', color: 'var(--cyan)' }}
                  transition={{ delay: i * 0.4 + 0.3 }}
                >
                  ✓ {txt}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map content */}
      <motion.div
        className="flex-1 overflow-y-auto px-5 py-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: booting ? 0 : 1 }}
        transition={{ delay: 2.2 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="font-mono text-xs tracking-widest" style={{ color: 'var(--text-secondary)' }}>CAMPUS FLOOR PLAN</div>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, var(--border-bright), transparent)' }} />
          <div className="flex items-center gap-3">
            {Object.entries({ green: 'EMPTY', red: 'OCCUPIED', amber: 'HIGH PWR', blue: 'LEAK' }).map(([s, l]) => (
              <div key={s} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm" style={{ background: STATUS_COLORS[s], opacity: 0.8 }} />
                <span className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '9px' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {BUILDINGS.map((building, bi) => {
          const bRooms = ROOMS.filter(r => r.building === building.id);
          const floors = [...new Set(bRooms.map(r => r.floor))].sort();

          return (
            <motion.div
              key={building.id}
              className="mb-6 rounded-xl p-4"
              style={{ border: `1px solid ${building.color}20`, background: `${building.color}04` }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.4 + bi * 0.2 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: building.color }} />
                <span className="font-bold tracking-widest" style={{ color: building.color, fontSize: '12px' }}>
                  {building.name.toUpperCase()} — BLOCK {building.id}
                </span>
                <span className="font-mono ml-auto" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                  {floors.length} FL / {bRooms.length} ROOMS
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {floors.map(floor => (
                  <FloorMap
                    key={floor}
                    building={building}
                    floor={floor}
                    rooms={bRooms.filter(r => r.floor === floor)}
                    sensors={sensors}
                    selectedRoom={selectedRoom}
                    onSelect={onSelectRoom}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
