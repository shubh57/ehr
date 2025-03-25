// src/components/PatientHistoryCard.tsx

import { Box, Typography, useTheme, CircularProgress } from '@mui/material';
import { invoke } from '@tauri-apps/api/core';
import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';

interface PatientHistoryCardProps {
    patient_id: number;
}

export type PatientHistoryData = {
    last_visit: string;
    medical_conditions: string[];
    allergies: string[];
    medications: string[];
};

const renderBubbles = (items: string[] | undefined, emptyMessage: string) => {
    const theme = useTheme();

    if (!items || items.length === 0) {
        return (
            <Box
                sx={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                    borderRadius: '16px',
                    margin: '4px',
                }}
            >
                <Typography variant='body2' color={theme.palette.common.black}>
                    {emptyMessage}
                </Typography>
            </Box>
        );
    }

    return items.map((item, index) => (
        <Box
            key={index}
            sx={{
                display: 'inline-block',
                padding: '6px 12px',
                backgroundColor: theme.palette.background.paperDark,
                color: theme.palette.common.black,
                borderRadius: '16px',
                margin: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
        >
            <Typography variant='body2'>{item}</Typography>
        </Box>
    ));
};

const fetchPatientHistoryData = async (
    patientId: number
): Promise<PatientHistoryData> => {
    const data: any = await invoke('get_patient_history_data', { patientId });

    const formattedData: PatientHistoryData = {
        last_visit: data.last_visit,
        medical_conditions: JSON.parse(data.medical_conditions),
        medications: JSON.parse(data.medications),
        allergies: JSON.parse(data.allergies),
    };
    return formattedData;
};

const PatientHistoryCard: React.FC<PatientHistoryCardProps> = ({ patient_id }) => {
    const theme = useTheme();

    const [patientHistoryData, setPatientHistoryData] = useState<PatientHistoryData>();

    const patientHistoryQuery = useQuery<PatientHistoryData, Error>(['patient_history_data', patient_id], () => fetchPatientHistoryData(patient_id));
    const isLoading = patientHistoryQuery.isLoading;

    useEffect(() => {
        if (patientHistoryQuery.data) {
            setPatientHistoryData(patientHistoryQuery.data);
        }
    }, [patientHistoryQuery.data]);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                padding: '16px',
                borderRadius: '8px',
                boxShadow: theme.shadows[2],
                gap: '1rem',
            }}
        >
            {isLoading ? (
                <CircularProgress />
            ) : (
                <>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Box>
                            <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
                                Last Visit
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {patientHistoryData?.last_visit
                                    ? new Date(patientHistoryData.last_visit)
                                          .toLocaleDateString('en-GB', {
                                              day: 'numeric',
                                              month: 'long',
                                              year: 'numeric',
                                              hour: 'numeric',
                                              minute: '2-digit',
                                              hour12: true,
                                          })
                                          .replace(',', 'th,')
                                    : 'N/A'}
                            </Box>
                        </Box>
                        <Box>
                            <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
                                Medical Conditions
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {renderBubbles(patientHistoryData?.medical_conditions, 'No known medical conditions')}
                            </Box>
                        </Box>

                        <Box>
                            <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
                                Medications
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>{renderBubbles(patientHistoryData?.medications, 'No medications')}</Box>
                        </Box>

                        <Box>
                            <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
                                Allergies
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {renderBubbles(patientHistoryData?.allergies, 'No known allergies')}
                            </Box>
                        </Box>
                    </Box>
                </>
            )}
        </Box>
    );
};

export default PatientHistoryCard;
