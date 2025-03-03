"use client";

import { useEffect, useState, useMemo } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
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
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [stations, setStations] = useState<Station[]>([]); // Use Station interface
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState<string | null>(null); // Add error state

  useEffect(() => {
    setPassengers(initialPassengers);
  }, [initialPassengers]);

  // Fetch stations (using the PROXY)
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch('/api/supabaseProxy/from/stations/select/id,name'); // Use the proxy!

        console.log("response", response);
        if (!response.ok) {
            const errorData = await response.json();
            setError(errorData.message || 'Failed to fetch stations')
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setStations(data || []);
      } catch (error:any) {
        console.error("Error fetching stations:", error);
        setError(error.message || "An unknown error occurred"); // Set a user-friendly error message
      } finally {
        setLoading(false); // Set loading to false in all cases
      }
    };
    console.log("Here are the stations:", stations);

    fetchStations();
  }, []);

  // Realtime subscription (unconditionally)
  useEffect(() => {

    const channel = supabaseClient  //Correct Client
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
              prevPassengers.filter(
                (passenger) => passenger.id !== payload.old.id
              )
            );
          }
        }
      )
      .subscribe();

      console.log("Here are the passengers:", channel);  

    return () => {
      channel.unsubscribe();
    };
  }, []);

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
          <ScrollArea className="h-full no-scrollbar">
            {stations.map((station) => {
              const stationPassengers = passengersByStation[station.id] || [];

              return (
                <div key={station.id} className="mb-4">
                  <h2 className="text-lg font-semibold">
                    Station: {station.name}
                  </h2>
                  <ScrollArea className="h-40 no-scrollbar">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Destination</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stationPassengers.length > 0 ? (
                          stationPassengers.map((passenger) => (
                            <TableRow key={passenger.id}>
                              <TableCell>
                                {passenger.first_name} {passenger.last_name}
                              </TableCell>
                              <TableCell>
                                {getStationName(
                                  passenger.destination_station_id
                                )}
                              </TableCell>
                              <TableCell>{passenger.status}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center">
                              No passengers at this station.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
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
