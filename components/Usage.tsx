"use client";
import React, { useEffect, useState } from "react";

export default function CpuUsage() {
  const [cpuUsage, setCpuUsage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCpuUsage = async () => {
      try {
        const response = await fetch("/api/cpu-usage");
        const data = await response.json();
        setCpuUsage(data.usage);
      } catch (error) {
        console.error("Error fetching CPU usage:", error);
        setCpuUsage("Error");
      }
    };

    const interval = setInterval(fetchCpuUsage, 1000); // Fetch every second
    fetchCpuUsage();

    return () => clearInterval(interval); // Cleanup interval
  }, []);

  return (
    <div>
      <h1>Real-Time CPU Usage</h1>
      <p>{cpuUsage ? `${cpuUsage}%` : "Loading..."}</p>
    </div>
  );
}
