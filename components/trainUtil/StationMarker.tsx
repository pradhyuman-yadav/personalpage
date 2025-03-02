// app/components/StationMarker.tsx
import React from 'react';

interface StationMarkerProps {
    station: {
        id: string;
        name: string;
        x: number;
        y: number;
        current_passengers: number;
        is_surging?: boolean;
    };
    onClick: () => void;
}

const StationMarker: React.FC<StationMarkerProps> = ({ station, onClick }) => {
    return (
        <div
            key={station.id}
            className="absolute flex items-center justify-center rounded-full text-xs font-bold text-white shadow-md cursor-pointer"
            style={{
                left: station.x - 12,
                top: station.y - 12,
                width: '24px',
                height: '24px',
                backgroundColor: station.is_surging ? 'red' : 'blue',
                animation: station.is_surging ? 'pulse 2s infinite' : 'none',
            }}
            title={`Station: ${station.name}\nPassengers: ${station.current_passengers}`}
            onClick={onClick}
        >
            {station.current_passengers}
        </div>
    );
};

export default StationMarker;