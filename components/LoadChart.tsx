"use client";
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import axios from 'axios';

interface DataPoint {
  time: string;
  load: number;
  mem: number;
  disk: number;
  cpuTemperature: number;
  ms: number;
}

const CpuLoadChart: React.FC = () => {
  const [data, setData] = useState<DataPoint[]>([]);

  useEffect(() => {
    // Function to fetch CPU load data
    const fetchCpuLoad = async () => {
      try {
        const response = await axios.get('/api/cpu-usage');
        const newPoint: DataPoint = {
          time: new Date().toLocaleTimeString(),
          load: response.data.usage,
          mem: response.data.mem,
          disk: response.data.disk,
          cpuTemperature: response.data.cpuTemperature,
          ms: response.data.ms,
        };

        setData((prevData) => [...prevData.slice(-19), newPoint]); // Keep only the last 20 points
      } catch (error) {
        console.error('Error fetching CPU load:', error);
      }
    };

    // Fetch data every second
    const interval = setInterval(fetchCpuLoad, 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div >
      <p className="text-base mb-4">Real-Time Server CPU Load and Temp</p>
      <LineChart
        width={300}
        height={150}
        data={data}
        margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
      >
        <XAxis dataKey="time" hide />
        <YAxis domain={[0, 100]} hide />
        <Tooltip />
        <Line type="monotone" dataKey="load" stroke="#8884d8" dot={false} />
        <Line type="monotone" dataKey="cpuTemperature" stroke="#FF5733" dot={false} />
      </LineChart>
      <p className="text-base mb-4">Real-Time Server Mem and disk Load</p>
      <LineChart
        width={300}
        height={150}
        data={data}
        margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
      >
        <XAxis dataKey="time" hide />
        <YAxis domain={[0, 100]} hide />
        <Tooltip />
        <Line type="monotone" dataKey="mem" stroke="#FF33A8" dot={false} />
        <Line type="monotone" dataKey="disk" stroke="#FFA533" dot={false} />
      </LineChart>
      <p className="text-base mb-4">Real-Time Server Network latency</p>
      <LineChart
        width={300}
        height={150}
        data={data}
        margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
      >
        <XAxis dataKey="time" hide />
        <YAxis domain={[0, 100]} hide />
        <Tooltip />
        <Line type="monotone" dataKey="ms" stroke="#33FF57" dot={false} />
      </LineChart>
      <p className='border-t font-bold'>About this Server</p>
      <p className='text-xs font-light'>This self-hosted mini PC server, embedded within a meticulously optimized home network, operates as a high-efficiency compute node—balancing power, performance, and scalability. Engineered for resilience, it dynamically orchestrates workloads while real-time telemetry monitors CPU utilization, thermal thresholds, memory allocation, disk integrity, and network responsiveness. A compact powerhouse, seamlessly bridging edge computing with home-lab infrastructure. ⚡</p>
      
    </div>
  );
};

export default CpuLoadChart;
