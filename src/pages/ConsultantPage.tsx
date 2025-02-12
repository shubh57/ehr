import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Box, Typography, Paper, Grid, useTheme } from '@mui/material';
import Appointments from '../components/Appointments';
import { useNavigate } from 'react-router-dom';
import PatientList from '../components/PatientList';

export type Patient = {
    patient_id: number;
    mr_number: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: string;
    patient_photo: string;
    created_at: string;
};

const ConsultantPage = () => {
    const [patientData, setPatientData] = useState<Patient[]>([]);
    const navigate = useNavigate();
    const theme = useTheme();

    const fetchPatientData = async () => {
        try {
            const patients: Patient[] = await invoke('get_patients_data');
            setPatientData(patients);
        } catch (error) {
            console.error('Error fetching patient data:', error);
        }
    };

    useEffect(() => {
        fetchPatientData();
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
                        Consultant Portal
                    </Typography>
                </Box>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    marginTop: '2rem',
                }}
            >
                <Appointments />
            </Box>
            {/* <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    marginTop: '2rem',
                    backgroundColor: theme.palette.secondary.main,
                }}
            >
                <PatientList />
            </Box> */}
        </Box>
    );
};

export default ConsultantPage;
