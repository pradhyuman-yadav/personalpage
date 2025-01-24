import { NextResponse } from 'next/server';
import si from 'systeminformation';

// IMPORTANT: Force Next.js to use the Node.js runtime instead of the Edge runtime
export const runtime = 'nodejs'; 

export async function GET() {
  try {
    // Fetch current load using systeminformation
    const load = await si.currentLoad();
    const mem = await si.mem();
    const disk = await si.fsSize();
    const network = await si.inetChecksite('https://google.com');
    const cpuTemperature = await si.cpuTemperature();
    
    // Return JSON response (HTTP 200)
    return NextResponse.json({ usage: load.currentLoad.toFixed(2),
      mem: (mem.total - mem.available)/mem.total * 100,
      disk: disk[0].used / disk[0].size * 100,
      cpuTemperature: cpuTemperature.main,
      ms: network.ms,
     });
  } catch (error) {
    console.error('Error fetching usage:', error);
    
    // Return error as JSON (HTTP 500)
    return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 });
  }
}
