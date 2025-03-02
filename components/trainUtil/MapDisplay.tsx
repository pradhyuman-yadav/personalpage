// app/components/trainUtil/MapDisplay.tsx
import React from 'react';

interface MapDisplayProps {
    stations: {
        id: string;
        name: string;
        x: number;
        y: number;
        current_passengers: number;
        is_surging?: boolean;
    }[];
    trains: {
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
    }[];
    surgeEvents: {
        id: string;
        target_station_ids: string[];
        start_time: number;
        duration: number;
        passenger_multiplier: number;
    }[];
    routes: {
        id: string;
        line_id: string;
        name: string;
        direction: string;
        station_order: string[];
    }[];
    lines: { // Add lines prop
        id: string;
        name: string;
        color: string;
    }[];
    // onStationClick: (station: any) => void;
    // onTrainClick: (train: any) => void;
    onDeleteStation?: (stationId: string) => void;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ stations, routes, lines }) => {
    return (
        <div className="relative w-full h-full bg-gray-100 dark:bg-gray-900">
            {/* --- Draw Lines for Routes --- */}
            <svg className="absolute inset-0 w-full h-full">
                {routes?.map((route) => {
                    // Find the line associated with this route
                    const line = lines.find((l) => l.id === route.line_id);
                    const lineColor = line ? line.color : 'gray'; // Default to gray if line not found

                    return route.station_order?.map((stationId, index) => {
                        if (index < route.station_order.length - 1) {
                            const currentStation = stations.find(s => s.id === stationId);
                            const nextStation = stations.find(s => s.id === route.station_order[index + 1]);

                            if (currentStation && nextStation) {
                                return (
                                    <line
                                        key={`${route.id}-${stationId}-${nextStation.id}`}
                                        x1={currentStation.x}
                                        y1={currentStation.y}
                                        x2={nextStation.x}
                                        y2={nextStation.y}
                                        stroke={lineColor} // Use the determined line color
                                        strokeWidth="2"
                                    />
                                );
                            }
                        }
                        return null;
                    });
                })}
            </svg>

            {/* {stations.map((station) => (
                <StationMarker
                    key={station.id}
                    station={station}
                    onClick={() => onStationClick(station)}
                />
            ))}
            {trains.map((train) => (
                <TrainMarker
                    key={train.id}
                    train={train}
                    onClick={() => onTrainClick(train)}
                />
            ))} */}
        </div>
    );
};

export default MapDisplay;