// src/components/optics/ShimmerPatientVision.tsx

// Dependencies
import React from 'react';
import { Box, Card, CardContent, Skeleton } from '@mui/material';

const ShimmerPatientVision: React.FC = () => {
    return (
        <Box display='flex' alignItems='center' justifyContent='center' height='100%' width='9rem'>
            <Card
                sx={{
                    py: 1.5,
                    px: 2,
                    borderRadius: '28px',
                    bgcolor: 'background.paper',
                    boxShadow: 3,
                    marginTop: '2rem',
                    border: '0.5px solid black',
                    minHeight: '13rem',
                    maxHeight: '13rem',
                }}
            >
                <CardContent sx={{ p: 2 }}>
                    <Box display='flex' flexDirection='column' gap={1.5}>
                        {/* Header */}
                        <Box display='flex' alignItems='center' justifyContent='space-between' textAlign='center'>
                            <Skeleton variant='text' width={60} height={32} />
                            <Skeleton variant='circular' width={24} height={24} />
                        </Box>

                        {/* Divider */}
                        <Skeleton variant='text' width='100%' height={1} />

                        {/* Near Vision */}
                        <Box>
                            <Skeleton variant='text' width={20} height={16} />
                            <Skeleton variant='rectangular' width='100%' height={24} sx={{ mt: 0.5 }} />
                        </Box>

                        {/* Distant Vision */}
                        <Box>
                            <Skeleton variant='text' width={20} height={16} />
                            <Skeleton variant='rectangular' width='100%' height={24} sx={{ mt: 0.5 }} />
                        </Box>

                        {/* Last Updated */}
                        <Skeleton variant='text' width={120} height={12} sx={{ mt: 1, mx: 'auto' }} />
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ShimmerPatientVision;
