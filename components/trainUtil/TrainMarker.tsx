// app/components/trainUtil/TrainMarker.tsx
import React from 'react';

interface TrainMarkerProps {
    train: {
        id: string;
        position_x: number;
        position_y: number;
        status: string;
        line_id: string;
        current_station_id: string | null;
        next_station_id: string | null;
        current_passengers: number;
        current_speed: number;
        current_route_id: string | null;
        current_schedule_id: string | null;
    };
    onClick: () => void;
}

const TrainMarker: React.FC<TrainMarkerProps> = ({ train, onClick }) => {
    console.log("Rendering TrainMarker:", train);

    let lineColorClass = '';
    if (train.line_id === 'line-1') { //  Use correct IDs.
        lineColorClass = 'bg-red-500'; // Tailwind class for red
    } else if (train.line_id === 'line-2') {
        lineColorClass = 'bg-blue-500'; // Tailwind class for blue
    } else if (train.line_id === 'line-3') {
      lineColorClass = 'bg-green-500'
    }
    else {
        lineColorClass = 'bg-gray-500'; // Default color
    }

    return (
        <div
            key={train.id}
            className={`absolute text-xs cursor-pointer rounded-full flex items-center justify-center ${lineColorClass} text-white`}
            style={{
                left: train.position_x - 8,
                top: train.position_y - 8,
                width: '16px',
                height: '16px',
            }}
            title={`Train ID: ${train.id}\nStatus: ${train.status}\nPassengers: ${train.current_passengers}\nSpeed: ${train.current_speed.toFixed(2)} km/h\nRoute: ${train.current_route_id || 'N/A'}\nSchedule: ${train.current_schedule_id || 'N/A'}`}
            onClick={onClick}
        >
            {train.current_passengers}
        </div>
    );
};

export default TrainMarker;