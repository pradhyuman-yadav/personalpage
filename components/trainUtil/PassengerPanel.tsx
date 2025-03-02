"use client";

import { useEffect, useState, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Passenger {
  id: string;
  origin_station_id: string;
  destination_station_id: string;
  first_name: string;
  last_name: string;
  age: number;
  ticket_type: string;
  luggage_size: string;
  email: string;
  phone_number: string;
  spawn_time: string;
  status: string;
  current_station_id: string | null;
  train_id: string | null;
  patience: number | null;
  board_time: string | null;
  arrival_time: string | null;
}
interface Station {
  id: string;
  name: string;
}

interface Props {
  initialPassengers: Passenger[];
}

function PassengerPanel({ initialPassengers }: Props) {
  const [passengers, setPassengers] = useState<Passenger[]>(initialPassengers);
  const [stations, setStations] = useState<Station[]>([]); // Use Station interface
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState<string | null>(null); // Add error state


  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = (supabaseUrl && supabaseAnonKey) ? createBrowserClient(supabaseUrl, supabaseAnonKey) : null;


  // Fetch stations (unconditionally)
    useEffect(() => {
        if(!supabase) return;
        const fetchStations = async () => {
            const { data, error: fetchError } = await supabase.from("stations").select("id, name");
            if (fetchError) {
                console.error("Error fetching stations:", fetchError);
                setError("Failed to fetch stations."); // Set error state
                setLoading(false);
                return;
            }
            setStations(data || []);
            setLoading(false);
        };
        fetchStations();
    }, [supabase]);

// Realtime subscription (unconditionally)
    useEffect(() => {
        if (!supabase) return; // Don't subscribe if supabase client isn't ready

        const channel = supabase
            .channel("passenger-changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "passengers" },
                (payload) => {
                if (payload.eventType === "INSERT") {
                    setPassengers((prevPassengers) => [
                    ...prevPassengers,
                    payload.new as Passenger,
                    ]);
                } else if (payload.eventType === "UPDATE") {
                    setPassengers((prevPassengers) =>
                    prevPassengers.map((passenger) =>
                        passenger.id === payload.new.id
                        ? (payload.new as Passenger)
                        : passenger
                    )
                    );
                } else if (payload.eventType === "DELETE") {
                    setPassengers((prevPassengers) =>
                    prevPassengers.filter((passenger) => passenger.id !== payload.old.id)
                    );
                }
                }
            )
            .subscribe();

        return () => {
        channel.unsubscribe();
        };
    }, [supabase]); // Dependency on supabase

  // Group passengers (useMemo - outside any conditional)
  const passengersByStation = useMemo(() => {
    const grouped: Record<string, Passenger[]> = {};
      stations.forEach((station) => {
        grouped[station.id] = passengers.filter(
          (passenger) => passenger.origin_station_id === station.id
        );
      });
    return grouped;
  }, [passengers, stations]);

    // Find station name by ID
    const getStationName = (stationId: string) => {
        const station = stations.find((s) => s.id === stationId);
        return station ? station.name : stationId; // Return name or ID if not found
    };

  // Handle loading and error states
  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {/* ... (DialogTrigger) ... */}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Passengers</DialogTitle>
            <DialogDescription>Loading...</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {/* ... (DialogTrigger) ... */}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>{error}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }
  if (!supabase) {
        return <div>Error: Supabase configuration is missing.</div>;
  }

    return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Show Passengers</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>Passengers</DialogTitle>
          <DialogDescription>
            Real-time passenger information.
          </DialogDescription>
        </DialogHeader>
        <div className="h-[600px]">
          <ScrollArea className="h-full">
            {stations.map((station) => {
              const stationPassengers = passengersByStation[station.id] || [];
              const displayedPassengers = stationPassengers.slice(0, 5);
              const remainingPassengers = stationPassengers.slice(5);

              return (
                <div key={station.id} className="mb-4">
                  <h2 className="text-lg font-semibold">
                    Station: {station.name}
                  </h2>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayedPassengers.map((passenger) => (
                        <TableRow key={passenger.id}>
                          <TableCell>
                            {passenger.first_name} {passenger.last_name}
                          </TableCell>
                          <TableCell>
                            {getStationName(passenger.destination_station_id)}
                          </TableCell>
                          <TableCell>{passenger.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {remainingPassengers.length > 0 && (
                    <ScrollArea className="h-32 border rounded-md">
                      <Table>
                        <TableBody>
                          {remainingPassengers.map((passenger) => (
                            <TableRow key={passenger.id}>
                              <TableCell>
                                {passenger.first_name} {passenger.last_name}
                              </TableCell>
                              <TableCell>
                                {getStationName(passenger.destination_station_id)}
                              </TableCell>
                              <TableCell>{passenger.status}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  )}
                    {stationPassengers.length === 0 && (
                        <p className="text-sm text-gray-500">No passengers at this station.</p>
                    )}
                </div>
              );
            })}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PassengerPanel;