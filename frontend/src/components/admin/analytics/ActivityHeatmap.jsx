import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { ResponsiveHeatMap } from '@nivo/heatmap';

const ActivityHeatmap = ({ data }) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Activity Patterns
                </Typography>
                <div style={{ height: '400px' }}>
                    <ResponsiveHeatMap
                        data={data}
                        keys={hours}
                        indexBy="day"
                        margin={{ top: 60, right: 90, bottom: 60, left: 90 }}
                        forceSquare={true}
                        axisTop={{
                            tickSize: 5,
                            tickRotation: -90,
                            legend: 'Hour',
                            legendPosition: 'middle',
                            legendOffset: 46
                        }}
                        axisRight={null}
                        axisBottom={null}
                        axisLeft={{
                            tickSize: 5,
                            tickRotation: 0,
                            legend: 'Day',
                            legendPosition: 'middle',
                            legendOffset: -72
                        }}
                        colors={{
                            type: 'sequential',
                            scheme: 'blues'
                        }}
                        emptyColor="#eeeeee"
                        borderColor="#ffffff"
                        labelTextColor="#ffffff"
                        animate={true}
                        motionConfig="gentle"
                        tooltip={({ value }) => (
                            <strong>
                                {value} transactions
                            </strong>
                        )}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default ActivityHeatmap; 