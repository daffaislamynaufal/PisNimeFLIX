'use client';

import { useState, useEffect } from 'react';

export default function OnlineCounter() {
  const [onlineCount, setOnlineCount] = useState(26);

  useEffect(() => {
    // Function to fetch the actual active user count from the backend API
    const fetchLiveUsers = async () => {
      try {
        const res = await fetch('/api/live-users', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (typeof data.onlineUsers === 'number') {
            setOnlineCount(data.onlineUsers);
          }
        }
      } catch (err) {
        console.error('Failed to fetch live users:', err);
      }
    };

    // Initial fetch on mount
    fetchLiveUsers();

    // Ping the backend API every 15 seconds to keep the session alive and update the counter
    const interval = setInterval(fetchLiveUsers, 15000);

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
