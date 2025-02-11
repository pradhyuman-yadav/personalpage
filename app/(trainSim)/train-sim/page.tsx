// app/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


interface Station {
  id: string;
  name: string;
  x: number;
  y: number;
  current_passengers: number;
}

interface Train {
  id: string;
  position_x: number;
  position_y: number;
  status: string;
  line_id: string;
  current_station_id: string | null;
  next_station_id: string | null;
  current_passengers: number;
  current_speed: number;
}

interface SimulationUpdateData {
  time: number;
  trains: Train[];
  stations: Station[];
}

export default function Home() {
  const [currentTime, setCurrentTime] = useState(0);
  const [trains, setTrains] = useState<Train[]>([]);
  const [stations, setStations] = useState<Station[]>([]);

  useEffect(() => {
    const socket = io('http://localhost:3001');

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('initialData', (data: { stations: Station[] }) => {
      setStations(data.stations);
    });

    socket.on('simulationUpdate', (data: SimulationUpdateData) => {
      setCurrentTime(data.time);
      setTrains(data.trains);
      setStations(prevStations =>
        prevStations.map(station => {
          const updatedStation = data.stations.find(s => s.id === station.id);
          return updatedStation ? { ...station, ...updatedStation } : station;
        })
      );
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col items-center p-4">
      <Card className="w-full max-w-4xl mb-4">
        <CardHeader>
          <CardTitle>Train Simulation</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Current Simulation Time: {currentTime}</p>
        </CardContent>
      </Card>

      <div className="relative w-[800px] h-[600px] border border-gray-300 rounded-lg bg-gray-100">
        {/* Render Stations */}
        {stations.map((station) => (
          <div
            key={station.id}
            className="absolute flex items-center justify-center rounded-full text-xs font-bold text-white shadow-md"
            style={{
              left: station.x - 12,  // Adjust centering as needed
              top: station.y - 12,   // Adjust centering as needed
              width: '24px',       // Slightly larger for better visibility
              height: '24px',      // Slightly larger for better visibility
              backgroundColor: 'blue',  // Default station color
            }}
            title={`Station: ${station.name}\nPassengers: ${station.current_passengers}`}
          >
            {station.current_passengers}
          </div>
        ))}

        {/* Render Trains */}
        {trains.map((train) => (
          <Badge
            key={train.id}
            variant={train.line_id === 'line-1' ? "destructive" : "secondary"} // Use shadcn variants
            className="absolute text-xs"
            style={{
              left: train.position_x -8, // Adjust positioning as needed
              top: train.position_y-8,   // Adjust positioning as needed
              width: '16px',
              height: '16px',

            }}
            title={`Train ID: ${train.id}\nStatus: ${train.status}\nPassengers: ${train.current_passengers}\nSpeed: ${train.current_speed.toFixed(2)} km/h`}
          >
              {train.current_passengers}
          </Badge>
        ))}
      </div>
        {/* Legend */}
      <div className='mt-4'>
        <Badge variant="destructive">Red Line Train</Badge>
        <Badge variant="secondary" className='ml-2'>Blue Line Train</Badge>
      </div>
    </div>
  );
}