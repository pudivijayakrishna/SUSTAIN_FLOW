import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { ResponsiveChoropleth } from '@nivo/geo';
import { features } from '../../../data/india-states.json';  // You'll need to add this GeoJSON file

const GeographicDistribution = ({ data }) => {
    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Geographic Distribution
                </Typography>
                <div style={{ height: '400px' }}>
                    <ResponsiveChoropleth
                        data={data}
                        features={features}
                        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                        colors="blues"
                        domain={[0, 100]}
                        unknownColor="#666666"
                        label="properties.name"
                        valueFormat=".2s"
                        projectionScale={1000}
                        projectionTranslation={[0.5, 0.5]}
                        projectionRotation={[0, 0, 0]}
                        enableGraticule={true}
                        graticuleLineColor="#dddddd"
                        borderWidth={0.5}
                        borderColor="#152538"
                        legends={[
                            {
                                anchor: 'bottom-left',
                                direction: 'column',
                                justify: true,
                                translateX: 20,
                                translateY: -100,
                                itemsSpacing: 0,
                                itemWidth: 94,
                                itemHeight: 18,
                                itemDirection: 'left-to-right',
                                itemTextColor: '#444444',
                                itemOpacity: 0.85,
                                symbolSize: 18,
                                effects: [
                                    {
                                        on: 'hover',
                                        style: {
                                            itemTextColor: '#000000',
                                            itemOpacity: 1
                                        }
                                    }
                                ]
                            }
                        ]}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default GeographicDistribution; 