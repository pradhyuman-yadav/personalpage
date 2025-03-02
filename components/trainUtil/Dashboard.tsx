// app/components/Dashboard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardProps {
    currentTime: number;
    // Add other props for additional metrics (e.g., totalPassengers, averageWaitTime)
}

const Dashboard: React.FC<DashboardProps> = ({ currentTime }) => {
    return (
        <Card className="w-full max-w-md bg-white dark:bg-gray-800 text-black dark:text-white">
            <CardHeader>
                <CardTitle className='text-black dark:text-white'>Simulation Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-black dark:text-white">Current Time: {currentTime}</p>
                {/* Add more metrics here */}
            </CardContent>
        </Card>
    );
};

export default Dashboard;