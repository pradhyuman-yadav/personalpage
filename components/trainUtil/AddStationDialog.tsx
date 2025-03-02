// app/components/AddStationDialog.tsx
import React, { useState } from 'react';
import {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface AddStationDialogProps {
    onAddStation: (newStationData: { name: string; x: number; y: number }) => void;
    onClose: () => void;
}

const AddStationDialog: React.FC<AddStationDialogProps> = ({ onAddStation, onClose }) => {
    const [newStationName, setNewStationName] = useState('');
    const [newStationX, setNewStationX] = useState<number | string>('');
    const [newStationY, setNewStationY] = useState<number | string>('');

    const handleAddStationSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        // Basic validation (important!)
        if (!newStationName || !newStationX || !newStationY) {
            alert('Please fill in all fields.');
            return;
        }

        const x = Number(newStationX);
        const y = Number(newStationY);

        if (isNaN(x) || isNaN(y)) {
            alert('Invalid coordinates.  Please enter numbers.');
            return;
        }

        onAddStation({ name: newStationName, x: x, y: y });
        setNewStationName('');
        setNewStationX('');
        setNewStationY('');
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New Station</DialogTitle>
                <DialogDescription>
                    Enter the details for the new station.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddStationSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="station-name">Station Name:</Label>
                    <Input
                        id="station-name"
                        type="text"
                        value={newStationName}
                        onChange={(e) => setNewStationName(e.target.value)}
                        required
                        placeholder="Enter station name"
                    />
                </div>
                <div>
                    <Label htmlFor="station-x">X Coordinate:</Label>
                    <Input
                        id="station-x"
                        type="number"
                        value={newStationX}
                        onChange={(e) => setNewStationX(e.target.value)}
                        required
                        placeholder="Enter X coordinate"
                    />
                </div>
                <div>
                    <Label htmlFor="station-y">Y Coordinate:</Label>
                    <Input
                        id="station-y"
                        type="number"
                        value={newStationY}
                        onChange={(e) => setNewStationY(e.target.value)}
                        required
                        placeholder="Enter Y coordinate"
                    />
                </div>
                {/* Add more input fields as needed (capacity, importance_level, etc.) */}
                <DialogFooter>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Add Station</Button>
                </DialogFooter>
            </form>
        </DialogContent>

    );
};

export default AddStationDialog;