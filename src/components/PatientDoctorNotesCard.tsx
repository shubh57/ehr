// src/components/PatientDoctorNotesCard.tsx

import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { invoke } from '@tauri-apps/api/core';
import React, { useEffect, useState } from 'react';
import { LockOpen, Lock } from '@mui/icons-material';

interface PatientDoctorNotesCardProps {
    patient_id: number;
}

export type PatientDoctorData = {
    doctors_note: string;
    patient_complaint: string;
    activity_time: string;
};

const PatientDoctorNotesCard: React.FC<PatientDoctorNotesCardProps> = ({ patient_id }) => {
    const theme = useTheme();

    const [isLoading, setIsLoading] = useState(false);
    const [patientDoctorData, setPatientDoctorData] = useState<PatientDoctorData[]>([]);
    const [showNotes, setShowNotes] = useState(false);

    const fetchPatientDoctorData = async () => {
        try {
            setIsLoading(true);
            const data: PatientDoctorData[] = await invoke('get_patient_doctor_data', { patientId: patient_id });
            console.log('data: ', data);
            setPatientDoctorData(data);
        } catch (error) {
            console.error('Error while fetching data: ', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPatientDoctorData();
    }, [patient_id]);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                gap: '1rem',
            }}
        >
            <Box
                sx={{
                    dislay: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    padding: '16px',
                    backgroundColor: theme.palette.secondary.main,
                    borderRadius: '8px',
                    boxShadow: theme.shadows[2],
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                    }}
                >
                    <Typography variant='h6' fontWeight='bold'>
                        Doctor's Notes
                    </Typography>
                    <Box
                        onClick={() => setShowNotes(!showNotes)}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            cursor: 'pointer',
                            color: 'text.secondary',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                        }}
                    >
                        {showNotes ? <LockOpen fontSize='small' /> : <Lock fontSize='small' />}
                        <Typography variant='caption'>{showNotes ? 'Hide Notes' : 'Show Notes'}</Typography>
                    </Box>
                </Box>

                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
                        <CircularProgress />
                    </Box>
                ) : patientDoctorData.length === 0 ? (
                    <Typography variant='body1' sx={{ textAlign: 'center', color: 'text.secondary' }}>
                        No doctor's note available
                    </Typography>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {patientDoctorData.map((point, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '12px',
                                    padding: '8px 12px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: '6px',
                                    transition: 'all 0.2s ease',
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
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        width: '100%',
                                        gap: 2,
                                    }}
                                >
                                    <Typography
                                        variant='body1'
                                        sx={{
                                            flex: 1,
                                            lineHeight: '1.5rem',
                                            filter: showNotes ? 'none' : 'blur(5px)',
                                            transition: 'filter 0.2s ease',
                                            userSelect: showNotes ? 'text' : 'none',
                                        }}
                                    >
                                        {point.doctors_note}
                                    </Typography>
                                    <Typography
                                        variant='caption'
                                        sx={{
                                            color: 'text.secondary',
                                            whiteSpace: 'nowrap',
                                            fontSize: '0.75rem',
                                            opacity: 0.8,
                                            filter: showNotes ? 'none' : 'blur(5px)',
                                        }}
                                    >
                                        {new Date(point.activity_time).toLocaleString('en-GB', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true,
                                        })}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>
            <Box
                sx={{
                    dislay: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    padding: '16px',
                    backgroundColor: theme.palette.secondary.main,
                    borderRadius: '8px',
                    boxShadow: theme.shadows[2],
                }}
            >
                <Typography variant='h6' fontWeight='bold'>
                    Patient Complaints
                </Typography>

                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
                        <CircularProgress />
                    </Box>
                ) : patientDoctorData.length === 0 ? (
                    <Typography variant='body1' sx={{ textAlign: 'center', color: 'text.secondary' }}>
                        No patient complaint available
                    </Typography>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {patientDoctorData.map((point, index) => (
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
                                        textWrap: 'wrap',
                                    }}
                                >
                                    {point.patient_complaint}
                                </Typography>
                                <Typography
                                    variant='caption'
                                    sx={{
                                        color: 'text.secondary',
                                        whiteSpace: 'nowrap',
                                        fontSize: '0.75rem',
                                        opacity: 0.8,
                                    }}
                                >
                                    {new Date(point.activity_time).toLocaleString('en-GB', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true,
                                    })}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default PatientDoctorNotesCard;
