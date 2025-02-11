// server/simulation.js

class Simulation {
    constructor(initialData, io) {
        this.stations = initialData.stations;
        this.lines = initialData.lines;
        this.trains = initialData.trains;
        this.passengers = initialData.passengers;
        this.io = io;
        this.time = 0;
        this.intervalId = null;
        this.passengerIdCounter = 1;
    }

    start() {
        this.intervalId = setInterval(() => {
            this.tick();
        }, 1000); // Adjust tick rate as needed (e.g., 500 for faster updates)
    }

    stop() {
        clearInterval(this.intervalId);
    }

    getInitialData() {
        return {
            stations: this.stations,
            lines: this.lines,
        };
    }

    tick() {
        this.time++;
        this.moveTrains();
        this.generatePassengers();
        this.updatePassengersPatience();
        this.sendUpdate();
    }

    moveTrains() {
        this.trains.forEach(train => {
            if (train.status === 'in_station') {
                this.departTrain(train);
            } else if (train.status === 'en_route') {
                this.updateTrainPosition(train);
            }
        });
    }
  departTrain(train) {
        const currentStation = this.stations.find(s => s.id === train.current_station_id);
        const line = this.lines.find(l => l.id === train.line_id);

        if (!currentStation || !line) {
            console.error("Train ", train.id, " is in an invalid state.");
            return;
        }

        const stationIndex = line.station_sequence.indexOf(currentStation.id);

        if (stationIndex === -1) {
            console.error("Train ", train.id, " is not found in the line.");
            return;
        }
      // Check if should depart based on dwell_time
      if(this.time < train.arrivalTime + (currentStation.dwell_time_override || train.dwell_time)) {
          return;
      }

        let nextStationId;
        // If the train is at the last station, go to the first station.
        if (stationIndex === line.station_sequence.length - 1) {
            nextStationId = line.station_sequence[0];
        } else {
            nextStationId = line.station_sequence[stationIndex + 1];
        }
        const nextStation = this.stations.find(s => s.id === nextStationId);
        if (!nextStation) {
            console.error("Next station not found for train:", train.id);
            return;
        }

        // Calculate distance and travel time
        const distance = Math.sqrt(
            Math.pow(nextStation.x - currentStation.x, 2) +
            Math.pow(nextStation.y - currentStation.y, 2)
        );
        // const travelTime = distance / train.max_speed * 30; //  Scale travel time No longer needed.
        // train.time_to_next_station = Math.round(travelTime); // No longer use this.

        // Update train status
        train.status = 'en_route';
        train.current_station_id = null;
        train.next_station_id = nextStationId;
        train.position_x = currentStation.x;
        train.position_y = currentStation.y;
        // train.current_speed = train.max_speed; // We'll start at 0 and accelerate
        train.distance_to_next_station = distance;
    }

    updateTrainPosition(train) {
        const nextStation = this.stations.find(s => s.id === train.next_station_id);
        if (!nextStation) {
            console.error("Next station not found for train:", train.id);
            return;
        }

        // Acceleration and Deceleration
        if (train.current_speed < train.max_speed && train.distance_to_next_station > (train.current_speed * train.current_speed)/(2* train.deceleration*3.6*3.6)) { // Multiply by 3.6 to convert km/h to m/s
            // Accelerate
            train.current_speed = Math.min(train.current_speed + train.acceleration * (1/3.6), train.max_speed); // 1/3.6 is the time
        }
         else if (train.distance_to_next_station <= (train.current_speed * train.current_speed)/(2* train.deceleration*3.6*3.6)) {
            // Decelerate  v^2 = 2*a*s => s = v^2/2a, here v is in km/h, so convert it.
            train.current_speed = Math.max(0, train.current_speed - train.deceleration * (1/3.6));
        }
        // else keep the speed constant

        // Calculate movement vector
        const dx = nextStation.x - train.position_x;
        const dy = nextStation.y - train.position_y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Normalize the vector
        const nx = dx / distance;
        const ny = dy / distance;

        // Calculate the distance to move in this tick
        const distanceToMove = train.current_speed/3.6 * (1); // speed/3.6 => m/s,  1 is tick time

        if(distanceToMove >= train.distance_to_next_station){
          this.arriveAtStation(train);
          return;
        }

        // Update position
        train.position_x += nx * distanceToMove;
        train.position_y += ny * distanceToMove;
        train.distance_to_next_station -= distanceToMove;

    }
   arriveAtStation(train) {
        const currentStation = this.stations.find(s => s.id === train.next_station_id); // Arriving at next_station
        if (!currentStation) {
            console.error('Next station not found for train:', train.id);
            return;
        }

        // --- DISEMBARKING ---
        let disembarked = 0;
        this.passengers = this.passengers.filter(passenger => {
            if (passenger.train_id === train.id && passenger.destination_station_id === currentStation.id) {
                // Passenger has arrived!
                passenger.status = 'arrived';
                passenger.train_id = null;
                passenger.current_station_id = currentStation.id; // They are now at the station (briefly)
                passenger.arrival_time = this.time;
                disembarked++;
                return false; // Remove passenger from the active list, as they have reached.
            }
            return true; // Keep other passengers
        });
        train.current_passengers -= disembarked;


        // --- BOARDING --- (Corrected Logic) ---
        let boarded = 0;
        const waitingPassengers = this.passengers.filter(p => p.current_station_id === currentStation.id && p.status === 'waiting');

        // Sort waiting passengers by patience (lowest patience first)
        waitingPassengers.sort((a, b) => a.patience - b.patience);

        for (const passenger of waitingPassengers) {
            if (train.current_passengers < train.capacity) { // Check capacity *before* boarding
                passenger.train_id = train.id;
                passenger.current_station_id = null;
                passenger.status = 'in_transit';
                passenger.board_time = this.time;
                train.current_passengers++;
                boarded++;
                // We *don't* decrement station passengers here anymore!
            } else {
                break; // Train is full, stop boarding
            }
        }

        // Update station's passenger count *after* boarding
        currentStation.current_passengers -= boarded;


        // Update train properties (after boarding/disembarking)
        train.current_station_id = currentStation.id;
        train.next_station_id = null;
        train.position_x = currentStation.x;
        train.position_y = currentStation.y;
        train.status = 'in_station';
        train.current_speed = 0;
        train.time_to_next_station = 0; // Reset on arrival
        train.arrivalTime = this.time;
        train.distance_to_next_station = 0; // Reset on arrival.

        console.log(`Train ${train.id} arrived at ${currentStation.name}. Disembarked: ${disembarked}, Boarded: ${boarded}`);
    }


    sendUpdate() {
        const trainData = this.trains.map(train => ({
            id: train.id,
            position_x: train.position_x,
            position_y: train.position_y,
            status: train.status,
            line_id: train.line_id,
            current_station_id: train.current_station_id,
            next_station_id: train.next_station_id,
            current_passengers: train.current_passengers, // Send passenger count
            current_speed: train.current_speed,
        }));

        const stationData = this.stations.map(station => ({
            id: station.id,
            name: station.name,
            x: station.x,
            y: station.y,
            current_passengers: station.current_passengers,
        }));

        this.io.emit('simulationUpdate', {
            time: this.time,
            trains: trainData,
            stations: stationData,
        });
    }

    generatePassengers() {
        this.stations.forEach(station => {
            // Basic passenger generation
            if (this.time % 5 === 0) {
                const numNewPassengers = Math.floor(Math.random() * (station.importance_level + 1) * 2);

                for (let i = 0; i < numNewPassengers; i++) {
                    const destinationStation = this.getRandomDestination(station.id);
                    if (destinationStation) {
                        this.passengers.push(this.createPassenger(station.id, destinationStation.id));
                    }
                }
                // *Don't* increment station.current_passengers here.  It's only decremented during boarding.
                station.current_passengers += numNewPassengers; // Increment passengers.
            }
        });
    }
      getRandomDestination(originStationId){
        const otherStations = this.stations.filter(station => station.id !== originStationId);
        if(otherStations.length === 0) return null; // No other station
        const randomIndex = Math.floor(Math.random() * otherStations.length);
        return otherStations[randomIndex];
      }
    createPassenger(originStationId, destinationStationId) {
      const newPassenger = {
          id: `passenger-${this.passengerIdCounter++}`, // Simple ID generation
          origin_station_id: originStationId,
          destination_station_id: destinationStationId,
          current_station_id: originStationId,
          train_id: null,
          patience: Math.floor(Math.random() * 30) + 30, // Random patience between 30 and 60
          status: 'waiting',
          spawn_time: this.time,
          board_time: null,
          arrival_time: null,
      };
      return newPassenger;
    }
    updatePassengersPatience(){
        this.passengers.forEach(passenger => {
          if(passenger.status == 'waiting'){
            passenger.patience--;
            if(passenger.patience <= 0){
              passenger.status = 'left';
            }
          }
        })
      }
}

module.exports = Simulation;