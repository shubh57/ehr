// src/components/PatientSummaryCard.tsx

import { Box, Typography, useTheme, CircularProgress } from '@mui/material';
import { invoke } from '@tauri-apps/api/core';
import React, { useEffect, useState } from 'react';

interface PatientSummaryCardProps {
    patient_id: number;
}

const PatientSummaryCard: React.FC<PatientSummaryCardProps> = ({ patient_id }) => {
    const theme = useTheme();

    const [patientSummary, setPatientSummary] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchPatientSummaryData = async () => {
        try {
            setIsLoading(true);
            const data: string[] = await invoke('get_patient_summary_data', { patientId: patient_id });
            console.log('data: ', data);
            setPatientSummary(data);
        } catch (error) {
            console.error('Error while fetching summary data: ', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPatientSummaryData();
    }, [patient_id]);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                padding: '16px',
                backgroundColor: theme.palette.secondary.main,
                borderRadius: '8px',
                boxShadow: theme.shadows[2],
                gap: '1rem',
            }}
        >
            <Typography variant='h6' fontWeight='bold'>
                Summary
            </Typography>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
                    <CircularProgress />
                </Box>
            ) : patientSummary.length === 0 ? (
                <Typography variant='body1' sx={{ textAlign: 'center', color: 'text.secondary' }}>
                    No summary data available
                </Typography>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {patientSummary.map((point, index) => (
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

export default PatientSummaryCard;
