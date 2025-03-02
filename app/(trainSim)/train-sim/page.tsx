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
import { createBrowserClient } from "@supabase/ssr";

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

interface Passenger {  // <--- ADD THIS
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

export default function Home() {
  const [currentTime] = useState(0);
  const [trains] = useState<Train[]>([]);
  const [stations] = useState<Station[]>([]);
  const [surgeEvents] = useState<SurgeEvent[]>([]);
  const [isAddStationDialogOpen, setIsAddStationDialogOpen] = useState(false);
  // const [selectedResource, setSelectedResource] = useState<{
  //   type: "station" | "train" | null;
  //   data: any;
  // } | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [routes] = useState<Route[]>([]);
  const [lines] = useState<Line[]>([]);
  const [initialPassengers, setInitialPassengers] = useState<Passenger[]>([]);
  const [satisfaction, setSatisfaction] = useState<number>(100); // Initial satisfaction
  const [loadingSatisfaction, setLoadingSatisfaction] = useState(true); // Add a loading state

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch initial passengers *ONCE*
  useEffect(() => {
    const fetchInitialPassengers = async () => {
      const { data, error } = await supabase.from("passengers").select("*");
      if (error) {
        console.error("Error fetching initial passengers:", error);
      } else {
        setInitialPassengers(data || []);
      }
    };
    fetchInitialPassengers();
  }, [supabase]);

  // useEffect(() => {
  //   const socket = io("http://localhost:3001");

  //   socket.on("connect", () => {
  //     console.log("Connected to server");
  //     // NO initial passenger fetch here!
  //   });

  //   socket.on(
  //     "initialData",
  //     (data: { stations: Station[]; lines: any[]; routes: Route[] }) => {
  //       setStations(data.stations);
  //       setRoutes(data.routes);
  //       setLines(data.lines);
  //     }
  //   );

  //   socket.on("simulationUpdate", (data: SimulationUpdateData) => {
  //     setCurrentTime(data.time);
  //     setSurgeEvents(data.surgeEvents || []);

  //     setStations((prevStations) =>
  //       prevStations.map((station) => {
  //         const updatedStation = data.stations.find((s) => s.id === station.id);
  //         const isSurging = data.surgeEvents
  //           ? data.surgeEvents.some((event) =>
  //               event.target_station_ids.includes(station.id)
  //             )
  //           : false;
  //         return updatedStation
  //           ? { ...station, ...updatedStation, is_surging: isSurging }
  //           : { ...station, is_surging: isSurging };
  //       })
  //     );

  //     setTrains((prevTrains) =>
  //       prevTrains.map((train) => {
  //         const updatedTrain = data.trains.find((t) => t.id === train.id);
  //         return updatedTrain ? { ...train, ...updatedTrain } : train;
  //       })
  //     );
  //   });

  //   socket.on("stationAdded", (newStation: Station) => {
  //     setStations((prevStations) => [...prevStations, newStation]);
  //   });

  //   socket.on("stationDeleted", (stationId: string) => {
  //     setStations((prevStations) =>
  //       prevStations.filter((station) => station.id !== stationId)
  //     );
  //   });

  //   socket.on("disconnect", () => {
  //     console.log("Disconnected from server");
  //   });

  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []); // Empty dependency array: runs only on mount

  // Fetch satisfaction data
  useEffect(() => {
    const fetchSatisfaction = async () => {
      setLoadingSatisfaction(true); // Set loading to true before the fetch
      try {
        const response = await fetch(
          "http://localhost:7000/passengers/satisfaction"
        ); // Your FastAPI endpoint
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSatisfaction(data.satisfaction);
      } catch (error) {
        console.error("Error fetching satisfaction:", error);
        // Optionally set satisfaction to a default/error value
        setSatisfaction(100); // Or some other default/error value
      } finally {
        setLoadingSatisfaction(false);
      }
    };

    fetchSatisfaction();

    // Set up interval to refetch satisfaction (e.g., every 30 seconds)
    const intervalId = setInterval(fetchSatisfaction, 30000);

    return () => clearInterval(intervalId); // Clear interval on unmount
  }, []);

  // useEffect(() => {
  //   if (selectedResource) {
  //     if (selectedResource.type === "station") {
  //       const updatedStation = stations.find(
  //         (s) => s.id === selectedResource.data.id
  //       );
  //       if (
  //         updatedStation &&
  //         !shallowEqual(updatedStation, selectedResource.data)
  //       ) {
  //         setSelectedResource({ type: "station", data: updatedStation });
  //       }
  //     } else if (selectedResource.type === "train") {
  //       const updatedTrain = trains.find(
  //         (t) => t.id === selectedResource.data.id
  //       );
  //       if (
  //         updatedTrain &&
  //         !shallowEqual(updatedTrain, selectedResource.data)
  //       ) {
  //         setSelectedResource({ type: "train", data: updatedTrain });
  //       }
  //     }
  //   }
  // }, [stations, trains, selectedResource]);

  const handleAddStation = async (newStationData: {
    name: string;
    x: number;
    y: number;
  }) => {
    try {
      const response = await fetch("http://localhost:3001/api/stations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newStationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add station.");
      }
      setIsAddStationDialogOpen(false);
    } catch (error) {
      console.error("Error adding station:", error);
      alert(`Error adding station: ${error}`);
    }
  };

  const handleDeleteStation = async (stationId: string) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/stations/${stationId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete station.");
      }
    } catch (error) {
      console.error("Error deleting station:", error);
      alert(`Error deleting station: ${error}`);
    }
  };

  // const handleStationClick = (station: Station) => {
  //   setSelectedResource({ type: "station", data: station });
  //   setIsDrawerOpen(true);
  // };

  // const handleTrainClick = (train: Train) => {
  //   setSelectedResource({ type: "train", data: train });
  //   setIsDrawerOpen(true);
  // };

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
        <PassengerPanel initialPassengers={initialPassengers} />

        <Dialog
          open={isAddStationDialogOpen}
          onOpenChange={setIsAddStationDialogOpen}
        >
          <DialogTrigger asChild>
            <Button variant="outline">Add Station</Button>
          </DialogTrigger>
          <AddStationDialog
            onAddStation={handleAddStation}
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
          <p className="text-xl font-bold">Loading...</p>
        ) : (
          <div className="text-center">
            {" "}
            {/* Added a container for easier layout */}
            <p className="text-sm text-gray-600">
              {" "}
              {/* Smaller text, gray color */}
              Satisfaction
            </p>
            <p className="text-5xl font-bold">
              {" "}
              {/* Much larger text size */}
              <span className="">{satisfaction.toFixed(1)}%</span>
            </p>
          </div>
        )}
      </div>

      <ResourceDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        resource={null}
        onDeleteStation={handleDeleteStation}
      />
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

// Add this helper function (outside the component) for shallow comparison
// function shallowEqual(object1: any, object2: any): boolean {
//   if (!object1 || !object2) return false;
//   const keys1 = Object.keys(object1);
//   const keys2 = Object.keys(object2);

//   if (keys1.length !== keys2.length) {
//     return false;
//   }

//   for (let key of keys1) {
//     if (object1[key] !== object2[key]) {
//       return false;
//     }
//   }

//   return true;
// }
