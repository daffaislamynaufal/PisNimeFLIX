'use client';

import { useState, useEffect } from 'react';

export default function OnlineCounter() {
  const [onlineCount, setOnlineCount] = useState(1284);

  useEffect(() => {
    // Generate initial count based on current hour to make it realistic
    const hour = new Date().getHours();
    let baseCount = 1200;
    
    if (hour >= 18 && hour <= 23) {
      baseCount = 1850; // Peak hours (evening)
    } else if (hour >= 0 && hour <= 5) {
      baseCount = 550;  // Late night / early morning
    } else if (hour >= 6 && hour <= 11) {
      baseCount = 1100; // Morning
    } else {
      baseCount = 1500; // Afternoon
    }
    
    const randomOffset = Math.floor(Math.random() * 100) - 50;
    setOnlineCount(baseCount + randomOffset);

    // Fluctuate count slightly every 7 seconds
    const interval = setInterval(() => {
      setOnlineCount((prev) => {
        const change = Math.floor(Math.random() * 13) - 6; // -6 to +6
        const newCount = prev + change;
        return newCount < 100 ? 100 : newCount;
      });
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2.5 px-4.5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs select-none backdrop-blur-md shadow-md hover:bg-emerald-500/15 hover:border-emerald-500/35 transition-all hover:scale-105 active:scale-98 duration-300 cursor-pointer">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span className="font-mono text-sm tracking-tight">{onlineCount.toLocaleString('id-ID')}</span>
      <span className="text-[10px] text-emerald-400/80 font-semibold uppercase tracking-wider">Online</span>
    </div>
  );
}
