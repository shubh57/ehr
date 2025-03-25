// src/components/optics/ShimmerPatientRefraction.tsx

// Dependencies
import React from 'react';
import { Box, Card, CardContent, Skeleton } from '@mui/material';

const ShimmerPatientRefraction: React.FC = () => {
    return (
        <Box display='flex' justifyContent='center' width='18rem'>
            <Card
                sx={{
                    width: '100%',
                    py: 1.5,
                    px: 2,
                    borderRadius: '28px',
                    boxShadow: 3,
                    border: '0.5px solid black',
                    marginTop: '2rem',
                }}
            >
                <CardContent sx={{ p: 2 }}>
                    <Box display='flex' flexDirection='column' gap={1}>
                        {/* Header */}
                        <Box display='flex' justifyContent='space-between' alignItems='center'>
                            <Skeleton variant='text' width={120} height={24} />
                            <Skeleton variant='circular' width={24} height={24} />
                        </Box>

                        {/* Column Headers */}
                        <Box display='flex' justifyContent='space-around'>
                            {['SPH', 'CYL', 'AXIS'].map((_, index) => (
                                <Skeleton key={index} variant='text' width={40} height={20} />
                            ))}
                        </Box>

                        {/* Distance Vision (DV) Values */}
                        <Box>
                            <Skeleton variant='text' width={40} height={20} />
                            <Box display='flex' justifyContent='space-around' alignItems='center' mt={1}>
                                {[...Array(3)].map((_, index) => (
                                    <Skeleton key={index} variant='rectangular' width={50} height={32} />
                                ))}
                            </Box>
                        </Box>

                        {/* Near Vision (NV) Values */}
                        <Box mt={2}>
                            <Skeleton variant='text' width={40} height={20} />
                            <Box display='flex' justifyContent='space-around' alignItems='center' mt={1}>
                                {[...Array(3)].map((_, index) => (
                                    <Skeleton key={index} variant='rectangular' width={50} height={32} />
                                ))}
                            </Box>
                        </Box>

                        {/* Last Updated Info */}
                        <Skeleton variant='text' width={150} height={16} sx={{ mt: 2, mx: 'auto' }} />
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ShimmerPatientRefraction;
