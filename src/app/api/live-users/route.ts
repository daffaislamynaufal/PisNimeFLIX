export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

// In-memory Map to track active visitor pings.
// Key: Client IP address (or fallback), Value: Last active timestamp (epoch ms)
const activeUsers = new Map<string, number>();

// Clean up users who haven't pinged in the last 40 seconds
function performCleanup() {
  const now = Date.now();
  const cutoff = now - 40000; // 40 seconds timeout
  for (const [ip, lastPing] of activeUsers.entries()) {
    if (lastPing < cutoff) {
      activeUsers.delete(ip);
    }
  }
}

export async function GET(request: Request) {
  try {
    // Determine the IP address of the requester
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    // Record or refresh the activity of this visitor
    activeUsers.set(ip, Date.now());

    // Perform cleanup of expired visitor sessions
    performCleanup();

    // Get the actual number of active users
    const realCount = activeUsers.size;

    // Calculate a dynamic base count that fluctuates naturally depending on the hour of the day
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

    // Add a tiny random fluctuation based on timestamp to make it change slightly in real-time
    const secondSeed = Math.floor(Date.now() / 7000); // changes every 7 seconds
    const pseudoRandomOffset = (secondSeed % 41) - 20; // range: -20 to +20

    const finalCount = baseCount + pseudoRandomOffset + realCount;

    return NextResponse.json({
      onlineUsers: finalCount,
      pureCount: realCount
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (err) {
    console.error('Error in live-users API:', err);
    return NextResponse.json({ onlineUsers: 1, pureCount: 1 }, { status: 500 });
  }
}
