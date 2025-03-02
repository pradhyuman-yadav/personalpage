// app/components/trainUtil/ResourceDetailsDrawer.tsx
import React from 'react';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button";

interface Station {
    id: string;
    name: string;
    x: number;
    y: number;
    current_passengers: number;
    is_surging?: boolean;
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
    current_route_id: string | null;
    current_schedule_id: string | null;
  }

interface ResourceDetailsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    resource: { type: 'station'; data: Station } | { type: 'train'; data: Train } | null;
    onDeleteStation?: (stationId: string) => void;
}

const ResourceDetailsDrawer: React.FC<ResourceDetailsDrawerProps> = ({ isOpen, onClose, resource, onDeleteStation }) => {
    // This check and early return is correct and important.
    if (!resource) {
        return null;
    }

    return (
        <Drawer open={isOpen} onOpenChange={onClose}>
            <DrawerContent className="sm:max-w-md">
                <DrawerHeader>
                    <DrawerTitle>
                        {resource.type === 'station' ? `Station: ${resource.data.name}` : `Train ID: ${resource.data.id}`}
                    </DrawerTitle>
                    <DrawerDescription>
                        {resource.type === 'station'
                            ? `Details for station ${resource.data.name}`
                            : `Details for train ${resource.data.id}`}
                    </DrawerDescription>
                </DrawerHeader>
                <div className="p-4">
                    {resource.type === 'station' && (
                        <div>
                            <p><strong>ID:</strong> {resource.data.id}</p>
                            <p><strong>Coordinates:</strong> ({resource.data.x}, {resource.data.y})</p>
                            <p><strong>Passengers:</strong> {resource.data.current_passengers}</p>
                            {/* Add more station details here */}
                        </div>
                    )}
                    {resource.type === 'train' && (
                        <div>
                            <p><strong>ID:</strong> {resource.data.id}</p>
                            <p><strong>Line:</strong> {resource.data.line_id}</p>
                            <p><strong>Status:</strong> {resource.data.status}</p>
                            <p><strong>Passengers:</strong> {resource.data.current_passengers}</p>
                            <p><strong>Speed:</strong> {resource.data.current_speed.toFixed(2)} km/h</p>
                            <p><strong>Route:</strong> {resource.data.current_route_id || 'N/A'}</p>
                            <p><strong>Schedule:</strong> {resource.data.current_schedule_id || 'N/A'}</p>
                            {/* Add more train details here */}
                        </div>
                    )}
                </div>
                <DrawerFooter>
                    <DrawerClose asChild>
                        <Button variant="outline">Close</Button>
                    </DrawerClose>
                    {resource.type === 'station' && onDeleteStation && (
                        <Button variant="destructive" onClick={() => onDeleteStation(resource.data.id)}>
                            Delete Station
                        </Button>
                    )}
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
};

export default ResourceDetailsDrawer;