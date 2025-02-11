// server/data.js
async function loadData(supabase) {
    try {
        const { data: stations, error: stationsError } = await supabase
            .from('stations')
            .select('*');
        if (stationsError) throw stationsError;

        const { data: lines, error: linesError } = await supabase
            .from('lines')
            .select('*');
        if (linesError) throw linesError;

        const { data: trains, error: trainsError } = await supabase
            .from('trains')
            .select('*');
        if (trainsError) throw trainsError;

         //Initialize with no passengers
        const passengers = [];

        return { stations, lines, trains, passengers };

    } catch (error) {
        console.error('Error loading data from Supabase:', error);
        throw error; // Re-throw the error to be handled by the caller
    }
}

async function saveData(supabase, simulationData) {
    // Optional: Implement saving of simulation state to Supabase.
    // This is more complex and depends on what data you want to persist.
    // You might save aggregated statistics (passenger counts, delays) rather
    // than every single train position.  For now, leave this as a placeholder.
}

module.exports = { loadData, saveData };