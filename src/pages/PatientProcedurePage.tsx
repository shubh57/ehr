// src/components/PatientProcedurePage.tsx

import { ArrowBack } from '@mui/icons-material';
import { Box, Typography, useTheme } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PatientProcedureGrid from '../components/PatientProcedureGrid';

const PatientProcedurePage: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const swipeHandled = useRef(false);

    const { patient_id } = useParams();
    const patientId = parseInt(patient_id || '0');

    useEffect(() => {
        const handleWheel = (e: any) => {
            if (swipeHandled.current) return;
            e.preventDefault();

            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                const threshold = 20;
                if (e.deltaX > threshold) {
                    swipeHandled.current = true;
                    navigate(`/patient_optics/${patient_id}`);

                    setTimeout(() => {
                        swipeHandled.current = false;
                    }, 50000);
                } else if (e.deltaX < -threshold) {
                    // navigate(`/patient_optics/${patient_id}`);
                }
            }
        };

        const handleKeyDown = (e: any) => {
            if (e.key === 'ArrowLeft') {
                // navigate(`/patient_procedure/${patient_id}`);
            } else if (e.key === 'ArrowRight') {
                navigate(`/patient_optics/${patient_id}`);
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
                    <ArrowBack onClick={() => navigate(`/patient_details/${patientId}`)} />
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
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                }}
            >
                <PatientProcedureGrid patient_id={patientId} />
            </Box>
        </Box>
    );
};

export default PatientProcedurePage;
