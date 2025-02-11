// src/components/optics/ChiefComplaints.tsx

// Dependencies
import { useToast } from '@chakra-ui/react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { invoke } from '@tauri-apps/api/core';
import React, { useEffect, useState } from 'react';

const ChiefComplaints: React.FC<{ patient_id: number }> = ({ patient_id }) => {
    const theme = useTheme();
    const toast = useToast();

    const [patientComplaints, setPatientComplaints] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const fetchPatientComplaints = async () => {
        try {
            setIsLoading(true);
            const data: string[] = await invoke('get_patient_complaints', { patientId: patient_id });
            setPatientComplaints(data);
        } catch (error) {
            console.error('Error while fetching patient complaints: ', error);
            toast({
                title: `Error while fetching patient complaints data: ${error}`,
                status: 'error',
                duration: 4000,
                isClosable: true,
                position: 'top',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPatientComplaints();
    }, []);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                padding: '16px',
                backgroundColor: theme.palette.secondary.main,
                borderRadius: '28px',
                border: '0.5px solid black',
                boxShadow: theme.shadows[2],
                gap: '1rem',
            }}
        >
            <Typography variant='h6' fontWeight='bold'>
                Chief Complaints
            </Typography>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
                    <CircularProgress />
                </Box>
            ) : patientComplaints.length === 0 ? (
                <Typography variant='body1' sx={{ textAlign: 'center', color: 'text.secondary' }}>
                    No patient complaints available
                </Typography>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {patientComplaints.map((point: String, index: number) => (
                        <Box
                            key={index}
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                padding: '8px 12px',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '6px',
                                transition: 'transform 0.2s ease',
                                '&:hover': {
                                    transform: 'translateX(4px)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                },
                            }}
                        >
                            <Typography
                                sx={{
                                    color: theme.palette.primary.main,
                                    fontWeight: 'bold',
                                    fontSize: '1.2rem',
                                    lineHeight: '1.5rem',
                                }}
                            >
                                •
                            </Typography>
                            <Typography
                                variant='body1'
                                sx={{
                                    flex: 1,
                                    lineHeight: '1.5rem',
                                }}
                            >
                                {point}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default ChiefComplaints;
