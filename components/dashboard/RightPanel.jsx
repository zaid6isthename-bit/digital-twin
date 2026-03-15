// components/dashboard/RightPanel.jsx
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { ROOMS, getAIInsights } from '@/lib/sensorData';
import { Brain, TrendingUp, AlertCircle, Zap } from 'lucide-react';

const STATUS_COLORS = {
  green: '#00ff94', red: '#ff3d5a', amber: '#fbbf24', blue: '#3b82f6',
};

const PRIO_COLORS = { critical: '#ff3d5a', high: '#f97316', medium: '#fbbf24', low: '#00ff94' };

// Custom tooltip for recharts
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="font-mono text-xs px-2 py-1.5 rounded" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)', color: 'var(--cyan)', fontSize: '10px' }}>
      <div style={{ color: 'var(--text-secondary)' }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey}>{p.name}: <strong style={{ color: p.color || 'var(--cyan)' }}>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</strong></div>
      ))}
    </div>
  );
}

function EnergyChart({ sensors, history }) {
  const data = history.map((v, i) => ({ t: i + 1, kW: v }));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-xs tracking-widest" style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>ENERGY TREND (20 ticks)</span>
        <div className="flex items-center gap-1">
          <Zap size={10} style={{ color: '#fbbf24' }} />
          <span className="font-mono" style={{ color: '#fbbf24', fontSize: '10px' }}>{history[history.length-1]?.toFixed(1)}kW</span>
        </div>
      </div>
      <div style={{ height: 80 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="egGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#00d4ff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <XAxis dataKey="t" tick={{ fontSize: 8, fill: '#2d4a62', fontFamily: 'Share Tech Mono' }} />
            <YAxis tick={{ fontSize: 8, fill: '#2d4a62', fontFamily: 'Share Tech Mono' }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="kW" name="Total kW" stroke="#00d4ff" strokeWidth={1.5} fill="url(#egGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function OccupancyBars({ sensors }) {
  const data = ROOMS.map(r => ({
    id: r.id,
    pct: Math.round((sensors[r.id]?.occupancy || 0) / r.cap * 100),
    energy: sensors[r.id]?.energy || 0,
  }));

  return (
    <div>
      <div className="font-mono text-xs tracking-widest mb-2" style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>ROOM OCCUPANCY %</div>
      <div style={{ height: 90 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }} barSize={14}>
            <XAxis dataKey="id" tick={{ fontSize: 8, fill: '#2d4a62', fontFamily: 'Share Tech Mono' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 8, fill: '#2d4a62', fontFamily: 'Share Tech Mono' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="pct" name="Occ %" radius={[2, 2, 0, 0]}>
              {data.map(d => (
                <Cell key={d.id} fill={d.pct > 80 ? '#ff3d5a' : d.pct > 50 ? '#fbbf24' : d.pct > 10 ? '#00d4ff' : '#1a3a5c'} opacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function HeatmapGrid({ sensors }) {
  return (
    <div>
      <div className="font-mono text-xs tracking-widest mb-2" style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>ENERGY HEATMAP</div>
      <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {ROOMS.map(r => {
          const e   = sensors[r.id]?.energy || 0;
          const max = 6.5;
          const pct = e / max;
          const col = `hsl(${(1 - pct) * 180}, 90%, ${30 + pct * 30}%)`;
          return (
            <motion.div
              key={r.id}
              className="rounded flex flex-col items-center justify-center py-1.5"
              style={{ background: `${col}40`, border: `1px solid ${col}60`, cursor: 'default' }}
              animate={{ borderColor: [`${col}40`, `${col}90`, `${col}40`] }}
              transition={{ duration: 2 + Math.random() * 2, repeat: Infinity }}
              title={`${r.id}: ${e}kW`}
            >
              <span className="font-mono font-bold" style={{ color: col, fontSize: '9px' }}>{r.id}</span>
              <span className="font-mono" style={{ color: col, fontSize: '9px', opacity: 0.8 }}>{e}kW</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function AlertsFeed({ events }) {
  return (
    <div>
      <div className="font-mono text-xs tracking-widest mb-2" style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>LIVE ALERTS</div>
      <div className="flex flex-col gap-1 overflow-y-auto" style={{ maxHeight: '120px' }}>
        {events.length === 0 && (
          <div className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>No active alerts</div>
        )}
        {events.map((ev, i) => (
          <motion.div
            key={i}
            className="flex items-start gap-2 px-2 py-1.5 rounded font-mono"
            style={{
              background: ev.type === 'crit' ? 'rgba(255,61,90,0.08)' : ev.type === 'warn' ? 'rgba(251,191,36,0.07)' : 'rgba(0,255,148,0.06)',
              borderLeft: `2px solid ${ev.type === 'crit' ? '#ff3d5a' : ev.type === 'warn' ? '#fbbf24' : '#00ff94'}`,
              fontSize: '10px',
              color: ev.type === 'crit' ? '#ff8a80' : ev.type === 'warn' ? '#ffd54f' : '#a5d6a7',
            }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span>{ev.msg}</span>
            <span className="ml-auto flex-shrink-0" style={{ color: 'var(--text-muted)', fontSize: '9px' }}>{ev.t}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function AIInsights({ sensors }) {
  const insights = getAIInsights(sensors);

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Brain size={12} style={{ color: '#a855f7' }} />
        <span className="font-mono text-xs tracking-widest" style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>AI RECOMMENDATIONS</span>
        {insights.length > 0 && (
          <span className="font-mono px-1.5 py-0.5 rounded ml-auto" style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7', fontSize: '9px' }}>
            {insights.length}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1.5 overflow-y-auto" style={{ maxHeight: '140px' }}>
        {insights.length === 0 && (
          <div className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>All systems optimal</div>
        )}
        {insights.slice(0, 5).map((ins, i) => {
          const col = PRIO_COLORS[ins.prio] || '#6b90b0';
          return (
            <motion.div
              key={`${ins.room}-${i}`}
              className="px-2.5 py-2 rounded-lg"
              style={{ background: `${col}08`, border: `1px solid ${col}30` }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ x: 2 }}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span style={{ fontSize: '11px' }}>{ins.icon}</span>
                <span className="font-bold" style={{ color: col, fontSize: '11px' }}>{ins.room}</span>
                <span className="font-mono ml-1" style={{ color: 'var(--text-secondary)', fontSize: '9px', letterSpacing: '0.1em' }}>{ins.prio.toUpperCase()}</span>
                {ins.saving !== '₹0' && (
                  <span className="font-mono ml-auto" style={{ color: '#00ff94', fontSize: '9px' }}>{ins.saving}</span>
                )}
              </div>
              <div className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: '10px', lineHeight: '1.4' }}>
                {ins.msg}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function RightPanel({ sensors, energyHistory, events }) {
  const formattedEvents = events.slice(0, 15).map(ev => {
    const n = new Date();
    return { ...ev, t: `${n.getHours().toString().padStart(2,'0')}:${n.getMinutes().toString().padStart(2,'0')}:${n.getSeconds().toString().padStart(2,'0')}` };
  });

  return (
    <motion.aside
      className="flex flex-col h-full glass-bright overflow-y-auto"
      style={{ width: '280px', borderLeft: '1px solid var(--border)', flexShrink: 0 }}
      initial={{ x: 280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="px-3 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="font-mono text-xs tracking-widest" style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>LIVE ANALYTICS</div>
      </div>

      <div className="flex-1 px-3 py-3 flex flex-col gap-5">
        <EnergyChart sensors={sensors} history={energyHistory} />
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <OccupancyBars sensors={sensors} />
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <HeatmapGrid sensors={sensors} />
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <AlertsFeed events={formattedEvents} />
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <AIInsights sensors={sensors} />
        </div>
      </div>
    </motion.aside>
  );
}
