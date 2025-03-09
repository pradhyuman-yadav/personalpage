"use client";
import { useEffect, useState } from "react";
// import { io } from "socket.io-client";
import MapDisplay from "@/components/trainUtil/MapDisplay";
import AddStationDialog from "@/components/trainUtil/AddStationDialog";
import Dashboard from "@/components/trainUtil/Dashboard";
import Legend from "@/components/trainUtil/Legend";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import ResourceDetailsDrawer from "@/components/trainUtil/ResourceDetailsDrawer";
import PassengerPanel from "@/components/trainUtil/PassengerPanel";
import { Skeleton } from "@/components/ui/skeleton";

// ... (Your interfaces: Station, Train, SimulationUpdateData, SurgeEvent, Route) ...
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

// interface SimulationUpdateData {
//   time: number;
//   trains: Train[];
//   stations: Station[];
//   surgeEvents?: SurgeEvent[];
// }

interface SurgeEvent {
  id: string;
  target_station_ids: string[];
  start_time: number;
  duration: number;
  passenger_multiplier: number;
}

interface Route {
  id: string;
  line_id: string;
  name: string;
  direction: string;
  station_order: string[]; // Array of station IDs
}

interface Line {
  id: string;
  name: string;
  color: string;
}

interface Passenger {
  // <--- ADD THIS
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

interface ButtonWithSkeletonProps {
  isLoading: boolean; // Explicitly type isLoading as boolean
  initialPassengers: Passenger[]; // Add initialPassengers prop
  children: React.ReactNode;
}

function ButtonWithSkeleton({
  isLoading,
  initialPassengers,
}: ButtonWithSkeletonProps) {
  return (
    <>
      {isLoading ? (
        <Skeleton className="h-9 w-full" /> // Skeleton for loading state
      ) : (
        <PassengerPanel initialPassengers={initialPassengers} /> // Render the actual button content
      )}
    </>
  );
}

export default function Home() {
  const [currentTime] = useState(0);
  const [trains] = useState<Train[]>([]);
  const [stations] = useState<Station[]>([]);
  const [surgeEvents] = useState<SurgeEvent[]>([]);
  const [isAddStationDialogOpen, setIsAddStationDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [routes] = useState<Route[]>([]);
  const [lines] = useState<Line[]>([]);
  const [initialPassengers, setInitialPassengers] = useState<Passenger[]>([]);
  const [satisfaction, setSatisfaction] = useState<number>(100); // Initial satisfaction
  const [loadingSatisfaction, setLoadingSatisfaction] = useState(true); // Add a loading state
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial passengers *ONCE*
  useEffect(() => {
    const fetchInitialPassengers = async () => {
      try {
        // Fetch initial passengers using the proxy route
        const response = await fetch(
          "/api/supabaseProxy/passengers/initial-passengers"
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to fetch initial passengers"
          );
        }

        console.log(response)
        const data = await response.json();
        setInitialPassengers(data || []);
        setIsLoading(false); // Set loading to false after fetching
      } catch (error) {
        console.error("Error fetching initial passengers:", error);
        // Handle the error, e.g., display an error message to the user
      }
    };

    fetchInitialPassengers();
  }, []);

  // Fetch satisfaction data
  useEffect(() => {
    const fetchSatisfaction = async () => {
      // Set loading to true before the fetch
      try {
        const response = await fetch("/api/proxy/passengers/satisfaction"); // Your FastAPI endpoint
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSatisfaction(data.satisfaction);
        setLoadingSatisfaction(false);
      } catch (error) {
        console.error("Error fetching satisfaction:", error);
      }
    };
    fetchSatisfaction();

    // Set up interval to refetch satisfaction (e.g., every 30 seconds)
    const intervalId = setInterval(fetchSatisfaction, 30000);

    return () => clearInterval(intervalId); // Clear interval on unmount
  }, []);

  return (
    <div className="relative h-screen w-screen">
      <MapDisplay
        stations={stations}
        trains={trains}
        surgeEvents={surgeEvents}
        routes={routes}
        lines={lines}
      />

      <div className="absolute top-4 left-4 z-10">
        <Dashboard currentTime={currentTime} />
      </div>
      <div className="absolute top-24 right-4 z-10 flex flex-col space-y-4">
        {/* <PassengerPanel initialPassengers={initialPassengers} /> */}

        <ButtonWithSkeleton
          isLoading={isLoading}
          initialPassengers={initialPassengers}
        >
          Click Me
        </ButtonWithSkeleton>
        <Dialog
          open={isAddStationDialogOpen}
          onOpenChange={setIsAddStationDialogOpen}
        >
          <DialogTrigger asChild>
            <Button variant="outline">Add Station</Button>
          </DialogTrigger>
          <AddStationDialog
            onAddStation={() => {}}
            onClose={() => setIsAddStationDialogOpen(false)}
          />
        </Dialog>
      </div>
      <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 ">
        <h1 className="text-8xl font-bold text-white">Under Development</h1>
      </div>
      <div className="absolute bottom-4 right-4 z-10">
        <Legend />
      </div>

      {/* Satisfaction Display */}
      <div className="absolute bottom-12 right-4 z-10 ">
        {loadingSatisfaction ? (
          <Skeleton className="h-12 w-20 rounded-md" />
        ) : (
          <div className="text-center">
            <p className="text-sm text-gray-600">Satisfaction</p>
            <p className="text-5xl font-bold">
              <span className="">{satisfaction.toFixed(1)}%</span>
            </p>
          </div>
        )}
      </div>

      <ResourceDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        resource={null}
        onDeleteStation={() => {}}
      />
    </div>
  );
}
