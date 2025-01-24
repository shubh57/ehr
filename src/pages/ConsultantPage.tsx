import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Box, Typography, Paper, Grid } from '@mui/material';
import Appointments from '../components/Appointments';
import { useNavigate } from 'react-router-dom';

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
        <Box sx={{ p: 3 }}>
            <Appointments />
            <Typography variant='h4' sx={{ mb: 3 }}>
                Patient List
            </Typography>

            <Grid container spacing={3}>
                {patientData.map((patient) => (
                    <Grid item xs={12} key={patient.patient_id}>
                        <Paper sx={{ p: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Typography
                                        variant='h6'
                                        sx={{
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <div onClick={() => navigate(`/patient_details/${patient.patient_id}`)}>
                                            {patient.first_name} {patient.last_name}
                                        </div>
                                    </Typography>
                                    <Typography color='textSecondary'>MR#: {patient.mr_number}</Typography>
                                    <Typography>Gender: {patient.gender}</Typography>
                                    <Typography>DOB: {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography color='textSecondary'>
                                        Created: {patient.created_at ? new Date(patient.created_at).toLocaleString() : 'N/A'}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default ConsultantPage;
