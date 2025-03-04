// utils/passengerUtils.ts

import { Database } from '@/types/supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

type Passenger = Database['public']['Tables']['passengers']['Row'];
type Station = Database['public']['Tables']['stations']['Row'];

// Helper function to get all stations
async function getAllStations(supabase: SupabaseClient): Promise<Station[]> {
  const { data, error } = await supabase.from('stations').select('*');
  if (error) {
    console.error("Error fetching stations:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
  return data || []; // Return empty array if data is null
}


// Function to spawn a new passenger
export async function spawnPassenger(
  supabase: SupabaseClient
): Promise<Passenger> {
  const stations = await getAllStations(supabase);
  if (stations.length < 2) {
    throw new Error("Not enough stations to create a passenger journey.");
  }

  // Randomly select origin and destination stations (ensure they are different)
  let originStation: Station;
  let destinationStation: Station;

  do {
    originStation = stations[Math.floor(Math.random() * stations.length)];
    destinationStation = stations[Math.floor(Math.random() * stations.length)];
  } while (originStation.id === destinationStation.id);


    const newPassenger: Database['public']['Tables']['passengers']['Insert'] = {
    id: uuidv4(),
    origin_station_id: originStation.id,
    destination_station_id: destinationStation.id,
    spawn_time: new Date().toISOString(),
    status: 'waiting', // Initial status
    age: Math.floor(Math.random() * 60) + 18, // Example: Age between 18 and 77
    luggage_size: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)] as Database['public']['Enums']['luggage_size_enum'], //Random luggage
    ticket_type: ['single', 'day_pass', 'weekly_pass', 'monthly_pass'][Math.floor(Math.random() * 4)] as Database['public']['Enums']['ticket_type_enum'],
    patience: Math.random() * 5 + 5, // Example patience level (e.g., between 5 and 10 minutes)
    current_station_id: originStation.id //Initially at origin station.
  };

  const { data, error } = await supabase
    .from('passengers')
    .insert(newPassenger)
    .select()
    .single(); // Use .single() to get the inserted row directly

  if (error) {
    console.error("Error spawning passenger:", error);
    throw error;
  }
    if (!data) {
        throw new Error("Failed to spawn passenger: No data returned.");
    }

  return data;
}

// Function to get all waiting passengers at a specific station
export async function getWaitingPassengersAtStation(
  supabase: SupabaseClient,
  stationId: string
): Promise<Passenger[]> {
  const { data, error } = await supabase
    .from('passengers')
    .select('*')
    .eq('current_station_id', stationId)
    .eq('status', 'waiting');

  if (error) {
    console.error("Error fetching waiting passengers:", error);
    throw error;
  }
  return data || [];
}

//Function to update passenger status
export async function updatePassengerStatus(supabase: SupabaseClient, passengerId: string, newStatus: Database['public']['Enums']['passenger_status'], trainId: string | null = null, currentStationId: string | null = null): Promise<Passenger> {
    const updateData: Database['public']['Tables']['passengers']['Update'] = {
        status: newStatus,
    };

    //Only update train id if provided.
    if (trainId !== null) {
      updateData.train_id = trainId;
    }
    //same with current station id.
    if (currentStationId !== null) {
        updateData.current_station_id = currentStationId
    }


    if(newStatus == 'boarding'){
      updateData.board_time = new Date().toISOString();
    }
    if(newStatus == 'arrived'){
        updateData.arrival_time = new Date().toISOString();
    }

  const { data, error } = await supabase
    .from('passengers')
    .update(updateData)
    .eq('id', passengerId)
    .select()
    .single();

  if (error) {
    console.error('Error updating passenger status:', error);
    throw error;
  }
  if (!data) {
    throw new Error("Failed to update passenger: No data returned.");
  }
  return data;
}



// Example usage (in your main simulation loop or a test file):
// async function runSimulation() {
//   const supabase = supabaseClient

//   try {
//     // Spawn a passenger
//     const newPassenger = await spawnPassenger(supabase);
//     console.log('Spawned passenger:', newPassenger);

//     // Get waiting passengers at the new passenger's origin station
//     const waitingPassengers = await getWaitingPassengersAtStation(
//       supabase,
//       newPassenger.origin_station_id
//     );
//     console.log(`Waiting passengers at station ${newPassenger.origin_station_id}:`, waitingPassengers);

//     //Simulate passenger boarding a train.
//     const trainId = 'some-train-uuid'; //Replace with a real train id.
//     const updatedPassenger = await updatePassengerStatus(supabase, newPassenger.id, 'boarding', trainId);
//     console.log("Passenger boarding:", updatedPassenger)

//     //Simulate passenger arriving.
//     const arrivedPassenger = await updatePassengerStatus(supabase, newPassenger.id, 'arrived', null, newPassenger.destination_station_id);
//     console.log("Passenger Arrived:", arrivedPassenger);

//   } catch (error) {
//     console.error("Simulation error:", error);
//   }
// }

// runSimulation(); //Uncomment to test.