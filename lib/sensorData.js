// lib/sensorData.js
// Central data model & simulator for the Campus Digital Twin

export const BUILDINGS = [
  { id: 'A', name: 'Engineering Block', floors: 2, color: '#00d4ff' },
  { id: 'B', name: 'Science Complex',   floors: 3, color: '#a855f7' },
];

export const ROOMS = [
  // Building A
  { id: 'A101', building: 'A', floor: 1, name: 'Lab 101',      type: 'lab',       cap: 40, x: 10, y: 10, w: 38, h: 42 },
  { id: 'A102', building: 'A', floor: 1, name: 'Seminar 102',  type: 'seminar',   cap: 30, x: 52, y: 10, w: 36, h: 42 },
  { id: 'A103', building: 'A', floor: 1, name: 'Workshop 103', type: 'workshop',  cap: 25, x: 92, y: 10, w: 36, h: 42 },
  { id: 'A201', building: 'A', floor: 2, name: 'Class 201',    type: 'classroom', cap: 50, x: 10, y: 10, w: 44, h: 42 },
  { id: 'A202', building: 'A', floor: 2, name: 'Class 202',    type: 'classroom', cap: 45, x: 58, y: 10, w: 44, h: 42 },
  // Building B
  { id: 'B101', building: 'B', floor: 1, name: 'Auditorium',   type: 'auditorium',cap: 120,x: 10, y: 10, w: 80, h: 50 },
  { id: 'B102', building: 'B', floor: 1, name: 'Reception',    type: 'office',    cap: 10, x: 94, y: 10, w: 34, h: 50 },
  { id: 'B201', building: 'B', floor: 2, name: 'Research Lab', type: 'lab',       cap: 35, x: 10, y: 10, w: 60, h: 44 },
  { id: 'B202', building: 'B', floor: 2, name: 'Library',      type: 'library',   cap: 80, x: 74, y: 10, w: 54, h: 44 },
  { id: 'B301', building: 'B', floor: 3, name: 'Data Center',  type: 'server',    cap: 5,  x: 10, y: 10, w: 110, h: 44 },
];

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const rand  = (lo, hi) => lo + Math.random() * (hi - lo);
const walk  = (v, lo, hi, step) => clamp(v + (Math.random() - 0.48) * step, lo, hi);

export function initSensorState() {
  const state = {};
  ROOMS.forEach(r => {
    state[r.id] = {
      occupancy:   Math.floor(rand(0, r.cap * 0.85)),
      energy:      +rand(0.5, 5.5).toFixed(2),
      temperature: +rand(19, 29).toFixed(1),
      humidity:    Math.floor(rand(35, 70)),
      ac:          Math.random() > 0.4,
      waterFlow:   Math.random() > 0.93 ? 'LEAK' : 'normal',
      co2:         Math.floor(rand(400, 900)),
      light:       Math.floor(rand(100, 1000)),
    };
  });
  return state;
}

export function tickSensors(prev) {
  const next = {};
  const events = [];

  ROOMS.forEach(r => {
    const p = prev[r.id];
    const occ  = clamp(Math.round(walk(p.occupancy, 0, r.cap, 4)), 0, r.cap);
    const enrg = +walk(p.energy, 0.2, 6.5, 0.35).toFixed(2);
    const temp = +walk(p.temperature, 17, 33, 0.4).toFixed(1);
    const hum  = clamp(Math.round(walk(p.humidity, 30, 80, 3)), 30, 80);
    const ac   = Math.random() > 0.97 ? !p.ac : p.ac;
    let water  = p.waterFlow;
    if (Math.random() > 0.995) water = 'LEAK';
    else if (water === 'LEAK' && Math.random() > 0.6) water = 'normal';
    const co2  = clamp(Math.round(walk(p.co2, 400, 1200, 40)), 400, 1200);
    const light = clamp(Math.round(walk(p.light, 50, 1200, 60)), 50, 1200);

    next[r.id] = { occupancy: occ, energy: enrg, temperature: temp, humidity: hum, ac, waterFlow: water, co2, light };

    // Generate events
    if (water === 'LEAK' && p.waterFlow !== 'LEAK')
      events.push({ type: 'crit', room: r.id, msg: `💧 Water leak detected in ${r.id}` });
    if (ac && occ === 0 && Math.random() > 0.6)
      events.push({ type: 'warn', room: r.id, msg: `❄️ AC running, room empty: ${r.id}` });
    if (enrg > 5.5 && Math.random() > 0.7)
      events.push({ type: 'warn', room: r.id, msg: `⚡ High energy in ${r.id}: ${enrg}kW` });
    if (co2 > 1000 && Math.random() > 0.8)
      events.push({ type: 'warn', room: r.id, msg: `🌫️ High CO₂ in ${r.id}: ${co2}ppm` });
  });

  return { sensors: next, events };
}

export function getRoomStatus(sensors, roomId) {
  const d = sensors[roomId];
  if (!d) return 'green';
  if (d.waterFlow === 'LEAK')   return 'blue';
  if (d.energy > 5)              return 'amber';
  if (d.occupancy > 0)           return 'red';
  return 'green';
}

export function getAIInsights(sensors) {
  const insights = [];
  ROOMS.forEach(r => {
    const d = sensors[r.id];
    if (!d) return;
    if (d.waterFlow === 'LEAK')
      insights.push({ prio: 'critical', room: r.id, title: 'Water Leak', msg: `Immediate valve shutdown required in ${r.id}. Dispatch maintenance.`, saving: '₹2,400/hr', icon: '💧' });
    else if (d.ac && d.occupancy === 0)
      insights.push({ prio: 'high', room: r.id, title: 'AC Waste', msg: `${r.id} is empty but AC is running. Auto-shutdown recommended.`, saving: '₹180/hr', icon: '❄️' });
    else if (d.energy > 5)
      insights.push({ prio: 'medium', room: r.id, title: 'Energy Spike', msg: `${r.id} consuming ${d.energy}kW — above 5kW threshold.`, saving: '₹120/hr', icon: '⚡' });
    else if (d.co2 > 950)
      insights.push({ prio: 'medium', room: r.id, title: 'Poor Air Quality', msg: `CO₂ at ${d.co2}ppm in ${r.id}. Increase ventilation.`, saving: '₹0', icon: '🌫️' });
    else if (d.occupancy > 0 && d.occupancy < r.cap * 0.15)
      insights.push({ prio: 'low', room: r.id, title: 'Underutilized', msg: `${r.id} has only ${d.occupancy}/${r.cap} occupants. Consolidate classes.`, saving: '₹60/day', icon: '📊' });
  });
  return insights;
}

export function getCampusStats(sensors) {
  const totalEnergy   = ROOMS.reduce((s, r) => s + (sensors[r.id]?.energy || 0), 0);
  const totalOcc      = ROOMS.reduce((s, r) => s + (sensors[r.id]?.occupancy || 0), 0);
  const totalCap      = ROOMS.reduce((s, r) => s + r.cap, 0);
  const leaks         = ROOMS.filter(r => sensors[r.id]?.waterFlow === 'LEAK').length;
  const acWaste       = ROOMS.filter(r => sensors[r.id]?.ac && sensors[r.id]?.occupancy === 0).length;
  const avgTemp       = ROOMS.reduce((s, r) => s + (sensors[r.id]?.temperature || 0), 0) / ROOMS.length;
  const alerts        = leaks + acWaste + ROOMS.filter(r => (sensors[r.id]?.energy || 0) > 5).length;
  const health        = Math.max(0, 100 - alerts * 8 - leaks * 15);
  return { totalEnergy: +totalEnergy.toFixed(1), totalOcc, totalCap, leaks, acWaste, avgTemp: +avgTemp.toFixed(1), alerts, health };
}
