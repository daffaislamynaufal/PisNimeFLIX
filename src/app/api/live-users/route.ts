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

    // Optional: Add a base offset to make the counter look more populated (e.g., real count + 42)
    // Set to 0 if you want 100% pure real count.
    const baseOffset = 25; 
    const finalCount = realCount + baseOffset;

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
