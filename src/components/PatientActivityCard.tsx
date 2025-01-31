// src/components/PatientPreviousActivity.tsx

import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Chip, useTheme } from '@mui/material';
import { invoke } from '@tauri-apps/api/core';
import { useNavigate } from 'react-router-dom';

export type PatientActivity = {
    activity_id: number;
    activity: string;
    activity_time: string;
    status: string;
};

interface PatientActivityCardProps {
    patient_id: number;
}

const PatientActivityCard: React.FC<PatientActivityCardProps> = ({ patient_id }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [patientActivityData, setPatientActivityData] = useState<PatientActivity[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showAll, setShowAll] = useState(false);

    const fetchPatientActivityData = async () => {
        try {
            setIsLoading(true);
            const data: PatientActivity[] = await invoke('get_patient_activity_data', { patientId: patient_id });
            setPatientActivityData(data);
        } catch (error) {
            console.error('Error while fetching patient activity data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPatientActivityData();
    }, [patient_id]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return theme.palette.success.main;
            case 'TO_BE_REVIEWED':
                return theme.palette.warning.main;
            case 'INCOMPLETE':
                return theme.palette.error.main;
            default:
                return theme.palette.text.primary;
        }
    };

    const getTextColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return theme.palette.common.black;
            case 'TO_BE_REVIEWED':
                return theme.palette.common.black;
            default:
                return theme.palette.common.white;
        }
    };

    const getLabel = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'COMPLETED';
            case 'TO_BE_REVIEWED':
                return 'PENDING';
            case 'INCOMPLETE':
                return 'INCOMPLETE';
            default:
                return 'N/A';
        }
    };

    const displayedActivities = showAll ? patientActivityData : patientActivityData.slice(0, 3);

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
                gap: '2rem',
            }}
        >
            <Typography variant='h6' fontWeight='bold'>
                Previous Investigation
            </Typography>

            {isLoading ? (
                <Typography variant='body1' color='textSecondary'>
                    Loading activities...
                </Typography>
            ) : patientActivityData.length === 0 ? (
                <Typography variant='body1' color='textSecondary'>
                    No activities found for this patient.
                </Typography>
            ) : (
                displayedActivities.map((activity) => (
                    <Box
                        key={activity.activity_id}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px',
                            backgroundColor: theme.palette.background.paper,
                            borderRadius: '8px',
                            boxShadow: theme.shadows[1],
                        }}
                    >
                        <Box>
                            <Typography variant='body1' fontWeight='bold'>
                                {activity.activity}
                            </Typography>
                            <Typography variant='body2' color='textSecondary'>
                                {new Date(activity.activity_time).toLocaleString('en-GB', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true,
                                })}
                            </Typography>
                        </Box>
                        <Chip
                            label={getLabel(activity.status)}
                            sx={{
                                backgroundColor: getStatusColor(activity.status),
                                color: getTextColor(activity.status),
                                fontWeight: 'bold',
                            }}
                        />
                    </Box>
                ))
            )}

            {patientActivityData.length > 0 && (
                <Button
                    variant='contained'
                    onClick={() => navigate(`/patient_procedure/${patient_id}`)}
                    sx={{ alignSelf: 'flex-start', marginTop: '8px', backgroundColor: theme.palette.common.black, color: theme.palette.common.white }}
                >
                    {showAll ? 'View Less' : 'View All'}
                </Button>
            )}
        </Box>
    );
};

export default PatientActivityCard;
