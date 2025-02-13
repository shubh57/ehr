// src/pages/PatientDetails.tsx

import { Box, Typography, useTheme } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PatientCard from '../components/PatientCard';
import PatientActivityCard from '../components/PatientActivityCard';
import { ArrowBack } from '@mui/icons-material';
import PatientSummaryCard from '../components/PatientSummaryCard';
import PatientHistoryCard from '../components/PatientHistoryCard';
import PatientDoctorNotesCard from '../components/PatientDoctorNotesCard';

const PatientDetails = () => {
    const { patient_id } = useParams();
    const patientId = parseInt(patient_id || '0');
    const swipeHandled = useRef(false);

    const theme = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        const handleWheel = (e: any) => {
            if (swipeHandled.current) {
                return;
            }
            e.preventDefault();

            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                const threshold = 20;
                if (e.deltaX > threshold) {
                    // navigate(`/patient_optics/${patient_id}`);
                } else if (e.deltaX < -threshold) {
                    swipeHandled.current = true;
                    navigate(`/patient_optics/${patient_id}`);

                    setTimeout(() => {
                        swipeHandled.current = false;
                    }, 50000);
                }
            }
        };

        const handleKeyDown = (e: any) => {
            if (e.key === 'ArrowLeft') {
                navigate(`/patient_optics/${patient_id}`);
            } else if (e.key === 'ArrowRight') {
                // navigate(`/patient_details/${patient_id}`);
            }
        };

        // Attach the listener to the desired element or window
        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'top',
                minHeight: 'calc(100vh)',
                padding: '24px',
                backgroundColor: theme.palette.background.default,
                width: '100%',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                }}
            >
                <Box
                    sx={{
                        alignItems: 'flex-start',
                        cursor: 'pointer',
                    }}
                >
                    <ArrowBack onClick={() => navigate('/')} />
                </Box>
                <Box
                    sx={{
                        textAlign: 'center',
                        flexGrow: 1,
                    }}
                >
                    <Typography
                        sx={{
                            fontWeight: '600',
                            fontSize: '28px',
                            marginBottom: '10px',
                        }}
                    >
                        Patient Details
                    </Typography>
                </Box>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    marginTop: '0',
                }}
            >
                <Box
                    sx={{
                        width: '60%',
                        marginTop: '2rem',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            margin: '1rem',
                            gap: '1rem',
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '1rem',
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    width: '60%',
                                    gap: '1rem',
                                }}
                            >
                                <Box
                                    sx={{
                                        width: '100%',
                                    }}
                                >
                                    <PatientCard patient_id={patientId} />
                                </Box>
                                <Box
                                    sx={{
                                        width: '100%',
                                    }}
                                >
                                    <PatientHistoryCard patient_id={patientId} />
                                </Box>
                                <Box
                                    sx={{
                                        width: '100%',
                                    }}
                                >
                                    <PatientActivityCard patient_id={patientId} />
                                </Box>
                            </Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    width: '40%',
                                    borderRadius: '8px',
                                }}
                            >
                                <PatientDoctorNotesCard patient_id={patientId} />
                            </Box>
                        </Box>
                    </Box>
                </Box>
                <Box
                    sx={{
                        width: '40%',
                        marginTop: '3rem',
                        marginBottom: 'auto',
                    }}
                >
                    <PatientSummaryCard patient_id={patientId} />
                </Box>
            </Box>
        </Box>
    );
};

export default PatientDetails;
