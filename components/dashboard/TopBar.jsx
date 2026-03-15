// components/dashboard/TopBar.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Zap, Users, AlertTriangle, Activity, Wifi } from 'lucide-react';

function StatPill({ icon: Icon, label, value, unit, color, prev }) {
  const [display, setDisplay] = useState(0);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (value !== prev) {
      setFlash(true);
      setTimeout(() => setFlash(false), 600);
    }
    // Animate number
    const target = parseFloat(value) || 0;
    const start  = display;
    const steps  = 20;
    let i = 0;
    const step = () => {
      i++;
      setDisplay(+(start + (target - start) * (i / steps)).toFixed(1));
      if (i < steps) setTimeout(step, 30);
    };
    step();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <motion.div
      className="flex items-center gap-3 px-4 py-2 rounded-lg glass border-animated relative overflow-hidden"
      style={{ borderColor: flash ? color : 'transparent' }}
      animate={{ boxShadow: flash ? `0 0 20px ${color}60` : '0 0 0px transparent' }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-1.5 rounded" style={{ background: `${color}20` }}>
        <Icon size={14} style={{ color }} />
      </div>
      <div>
        <div className="text-xs font-mono" style={{ color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>{label}</div>
        <div className="flex items-baseline gap-1">
          <span className="text-base font-bold font-mono" style={{ color, lineHeight: 1 }}>
            {display}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{unit}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function TopBar({ stats, bootDone }) {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setTime(n.toLocaleTimeString('en-IN', { hour12: false }));
      setDate(n.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.header
      className="flex items-center justify-between px-5 py-2 glass-bright border-b z-50 relative"
      style={{ borderColor: 'var(--border)', minHeight: '56px' }}
      initial={{ y: -56, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <motion.div
            className="w-8 h-8 rounded"
            style={{ background: 'linear-gradient(135deg, #00d4ff, #a855f7)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-1 rounded" style={{ background: 'var(--bg-deep)' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full" style={{ background: '#00d4ff' }} />
          </div>
        </div>
        <div>
          <div className="font-orbitron text-sm font-bold text-glow-cyan tracking-widest" style={{ color: 'var(--cyan)', fontSize: '13px' }}>
            CAMPUS TWIN
          </div>
          <div className="text-xs font-mono" style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.15em' }}>
            DIGITAL INTELLIGENCE PLATFORM
          </div>
        </div>
      </div>

      {/* Stats */}
      <AnimatePresence>
        {bootDone && (
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <StatPill icon={Zap}           label="ENERGY"    value={stats.totalEnergy} unit="kW"     color="#00d4ff" />
            <StatPill icon={Users}         label="OCCUPANCY" value={stats.totalOcc}    unit="ppl"    color="#a855f7" />
            <StatPill icon={AlertTriangle} label="ALERTS"    value={stats.alerts}      unit="active" color={stats.alerts > 2 ? '#ff3d5a' : '#fbbf24'} />
            <StatPill icon={Activity}      label="SYS HEALTH" value={stats.health}     unit="%"      color={stats.health > 70 ? '#00ff94' : '#fbbf24'} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clock + status */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="font-mono font-bold" style={{ color: 'var(--cyan)', fontSize: '15px', letterSpacing: '0.1em' }}>{time}</div>
          <div className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: '10px', letterSpacing: '0.08em' }}>{date}</div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded" style={{ background: 'rgba(0,255,148,0.08)', border: '1px solid rgba(0,255,148,0.2)' }}>
          <Wifi size={10} style={{ color: '#00ff94' }} />
          <span className="font-mono text-xs" style={{ color: '#00ff94', fontSize: '10px' }}>LIVE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 ping-slow" />
        </div>
      </div>
    </motion.header>
  );
}
