// app/page.tsx
"use client";
import { useEffect, useState } from "react";
// import MapDisplay from "@/components/trainSimUtil/MapDisplay";
import AddStationDialog from "@/components/trainSimUtil/AddStationDialog";
import Legend from "@/components/trainSimUtil/Legend";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import PassengerPanel from "@/components/trainSimUtil/PassengerPanel";
import { Skeleton } from "@/components/ui/skeleton";

// Interfaces (Station, Train, SurgeEvent, Route, Line, Passenger) - No changes here, keep them as before.
interface Station {
  id: string;
  name: string;
  x: number;
  y: number;
  current_passengers: number;
  is_surging?: boolean;
}

// interface Train {
//   id: string;
//   position_x: number;
//   position_y: number;
//   status: string;
//   line_id: string;
//   current_station_id: string | null;
//   next_station_id: string | null;
//   current_passengers: number;
//   current_speed: number;
//   current_route_id: string | null;
//   current_schedule_id: string | null;
// }

// interface SurgeEvent {
//  id: string;
//  target_station_ids: string[];
//  start_time: number;
//  duration: number;
//  passenger_multiplier: number;
// }

// interface Route {
//  id: string;
//  line_id: string;
//  name: string;
//  direction: string;
//  station_order: string[]; // Array of station IDs
// }

// interface Line {
//  id: string;
//  name: string;
//  color: string;
// }

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

interface ButtonWithSkeletonProps {
  isLoading: boolean;
  initialPassengers: Passenger[];
  children: React.ReactNode;
}

function ButtonWithSkeleton({
  isLoading,
  initialPassengers,
}: ButtonWithSkeletonProps) {
  return (
    <>
      {isLoading ? (
        <Skeleton className="h-9 w-full" />
      ) : (
        <PassengerPanel initialPassengers={initialPassengers} />
      )}
    </>
  );
}


export default function Home() {
  // const [currentTime] = useState(0);
  // const [trains, setTrains] = useState<Train[]>([]);
  // const [stations, setStations] = useState<Station[]>([]);
  // const [surgeEvents] = useState<SurgeEvent[]>([]);
  const [isAddStationDialogOpen, setIsAddStationDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // const [routes, setRoutes] = useState<Route[]>([]);
  // const [lines, setLines] = useState<Line[]>([]);
  const [initialPassengers, setInitialPassengers] = useState<Passenger[]>([]);
  const [satisfaction, setSatisfaction] = useState<number>(100);
  const [loadingSatisfaction, setLoadingSatisfaction] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<Station | null>(null); //  Store the selected station

  setSelectedResource(selectedResource || null);
  setIsDrawerOpen(isDrawerOpen || false);
  

  // Fetch initial data (stations, routes, lines, trains)
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Stations
                const stationsResponse = await fetch("/api/supabaseProxy/stations");
                if (!stationsResponse.ok) throw new Error("Failed to fetch stations");
                // const stationsData = await stationsResponse.json();
                // setStations(stationsData);

                // Fetch Routes
                const routesResponse = await fetch("/api/supabaseProxy/routes");
                if (!routesResponse.ok) throw new Error("Failed to fetch routes");
                // const routesData = await routesResponse.json();
                // setRoutes(routesData);

                // Fetch Lines
                const linesResponse = await fetch("/api/supabaseProxy/lines");
                if (!linesResponse.ok) throw new Error("Failed to fetch lines");
                // const linesData = await linesResponse.json();
                // setLines(linesData);

                //Fetch trains
                const trainsResponse = await fetch("/api/supabaseProxy/trains");
                if(!trainsResponse.ok) throw new Error("Failed to fetch trains.");
                // const trainsData = await trainsResponse.json();
                // setTrains(trainsData);

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);


  // Fetch initial passengers
  useEffect(() => {
    const fetchInitialPassengers = async () => {
      try {
        const response = await fetch("/api/supabaseProxy/passengers/initial-passengers");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch initial passengers");
        }
        const data = await response.json();
        setInitialPassengers(data || []);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching initial passengers:", error);
      }
    };
    fetchInitialPassengers();
  }, []);

  // Fetch satisfaction data
  useEffect(() => {
    const fetchSatisfaction = async () => {
      try {
        const response = await fetch("/api/proxy/passengers/satisfaction");
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
    const intervalId = setInterval(fetchSatisfaction, 30000);
    return () => clearInterval(intervalId);
  }, []);



  // --- Click Handlers ---
  // const handleStationClick = (station: Station) => {
  //   setSelectedResource(station); // Set the selected station
  //   setIsDrawerOpen(true); // Open the drawer
  // };



  return (
    <div className="relative h-screen w-screen">
      {/* <MapDisplay
        stations={stations}
        trains={trains}
        surgeEvents={surgeEvents}
        routes={routes}
        lines={lines}
        onStationClick={handleStationClick}
      /> */}
      <div className="absolute top-24 right-4 z-10 flex flex-col space-y-4">
        <ButtonWithSkeleton isLoading={isLoading} initialPassengers={initialPassengers}>
            Passenger Panel
        </ButtonWithSkeleton>

        <Dialog open={isAddStationDialogOpen} onOpenChange={setIsAddStationDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Add Station</Button>
          </DialogTrigger>
          <AddStationDialog onAddStation={() => {}} onClose={() => setIsAddStationDialogOpen(false)} />
        </Dialog>
      </div>

      <div className="absolute bottom-4 right-4 z-10">
        <Legend />
      </div>

      <div className="absolute bottom-12 right-4 z-10">
        {loadingSatisfaction ? (
          <Skeleton className="h-12 w-20 rounded-md" />
        ) : (
          <div className="text-center">
            <p className="text-sm text-gray-600">Satisfaction</p>
            <p className="text-5xl font-bold">
              <span>{satisfaction.toFixed(1)}%</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}