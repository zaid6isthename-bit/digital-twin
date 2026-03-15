// pages/index.js
import Head from 'next/head';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

import { initSensorState, tickSensors, getCampusStats } from '@/lib/sensorData';
import TopBar      from '@/components/dashboard/TopBar';
import LeftPanel   from '@/components/dashboard/LeftPanel';
import RightPanel  from '@/components/dashboard/RightPanel';
import CampusMap   from '@/components/campus-map/CampusMap';

const ParticleBackground = dynamic(
  () => import('@/components/animations/ParticleBackground'),
  { ssr: false }
);

export default function Home() {
  const [sensors, setSensors]         = useState(() => initSensorState());
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [energyHistory, setEnergyHistory] = useState([]);
  const [events, setEvents]           = useState([]);
  const [stats, setStats]             = useState({ totalEnergy: 0, totalOcc: 0, totalCap: 0, leaks: 0, acWaste: 0, avgTemp: 0, alerts: 0, health: 100 });
  const [booting, setBooting]         = useState(true);
  const [bootDone, setBootDone]       = useState(false);
  const tickRef = useRef(null);

  // Boot sequence
  useEffect(() => {
    const t1 = setTimeout(() => setBooting(false), 2800);
    const t2 = setTimeout(() => setBootDone(true), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Sensor simulation loop
  useEffect(() => {
    const run = () => {
      setSensors(prev => {
        const { sensors: next, events: newEvents } = tickSensors(prev);

        // Update events feed
        setEvents(prevEv => [...newEvents, ...prevEv].slice(0, 30));

        // Energy history
        const totalE = Object.values(next).reduce((s, d) => s + d.energy, 0);
        setEnergyHistory(prevH => {
          const h = [...prevH, +totalE.toFixed(1)];
          return h.slice(-20);
        });

        // Stats
        setStats(getCampusStats(next));

        return next;
      });
    };

    tickRef.current = setInterval(run, 2000);
    // Run once immediately after boot
    const t = setTimeout(run, 3000);
    return () => { clearInterval(tickRef.current); clearTimeout(t); };
  }, []);

  return (
    <>
      <Head>
        <title>Campus Digital Twin</title>
      </Head>

      {/* Scan line effect */}
      <div className="scanline" />

      {/* Particle bg */}
      <ParticleBackground />

      {/* Main layout */}
      <div className="relative z-10 flex flex-col" style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
        <TopBar stats={stats} bootDone={bootDone} />

        <div className="flex flex-1 overflow-hidden">
          <LeftPanel
            sensors={sensors}
            selectedRoom={selectedRoom}
            onSelectRoom={setSelectedRoom}
          />

          <main className="flex-1 flex flex-col overflow-hidden relative">
            <CampusMap
              sensors={sensors}
              selectedRoom={selectedRoom}
              onSelectRoom={setSelectedRoom}
              booting={booting}
            />

            {/* Bottom ticker */}
            <motion.div
              className="font-mono overflow-hidden"
              style={{
                borderTop: '1px solid var(--border)',
                background: 'rgba(5,15,30,0.9)',
                padding: '4px 0',
                fontSize: '10px',
                color: 'var(--text-muted)',
                flexShrink: 0,
                letterSpacing: '0.05em',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: bootDone ? 1 : 0 }}
            >
              <motion.div
                style={{ display: 'inline-block', whiteSpace: 'nowrap' }}
                animate={{ x: [0, -1200] }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              >
                {Object.entries(sensors).map(([id, d]) =>
                  `  ${id}: OCC ${d.occupancy} | ${d.energy}kW | ${d.temperature}°C | AC:${d.ac ? 'ON' : 'OFF'} | H₂O:${d.waterFlow}  ///`
                ).join('  ')}
                {Object.entries(sensors).map(([id, d]) =>
                  `  ${id}: OCC ${d.occupancy} | ${d.energy}kW | ${d.temperature}°C | AC:${d.ac ? 'ON' : 'OFF'} | H₂O:${d.waterFlow}  ///`
                ).join('  ')}
              </motion.div>
            </motion.div>
          </main>

          <RightPanel
            sensors={sensors}
            energyHistory={energyHistory}
            events={events}
          />
        </div>
      </div>
    </>
  );
}
