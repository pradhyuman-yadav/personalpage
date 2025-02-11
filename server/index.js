// server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createClient } = require('@supabase/supabase-js');
const Simulation = require('./simulation');
const { loadData, saveData } = require('./data');

require('dotenv').config(); // Make sure .env loading is at the very top

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // !Important: Restrict this in production!
        methods: ["GET", "POST"]
    }
});

// Use environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("CRITICAL: Supabase URL and Anon Key must be defined in environment variables.");
  process.exit(1); // Exit the process if environment variables are missing
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PORT = process.env.PORT || 3001;

let simulation;

async function startServer() {
    try {
        const initialData = await loadData(supabase);
        console.log("Initial Data Loaded from Supabase:", initialData); // Keep this for verification

        simulation = new Simulation(initialData, io);

        io.on('connection', (socket) => {
            console.log('a user connected');
            socket.emit('initialData', simulation.getInitialData());
            socket.on('disconnect', () => {
                console.log('user disconnected');
            });
        });

        simulation.start();

        server.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });

    } catch (error) {
        console.error('Error starting server:', error); // The error will be logged here
    }
}
startServer();