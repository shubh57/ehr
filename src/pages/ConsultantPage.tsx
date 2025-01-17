import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Box, Typography, Paper, Grid } from '@mui/material';
import Appointments from "../components/Appointments";

export type Patient = {
    patient_id: number,
    mr_number: string,
    first_name: string,
    last_name: string,
    date_of_birth: Date,
    gender: string,
    appointment_time: Date,
    patient_photo: string,
    created_at: Date,
};

const ConsultantPage = () => {
    const [patientData, setPatientData] = useState<Patient[]>([]);

    const fetchPatientData = async () => {
        try {
            const data: string[][] = await invoke("get_patients_data");

            const patients: Patient[] = data.map((row) => ({
                patient_id: parseInt(row[0]),
                mr_number: row[1],
                first_name: row[2],
                last_name: row[3],
                date_of_birth: new Date(row[4]),
                gender: row[5],
                appointment_time: new Date(row[6].replace(" UTC", "+00:00")),
                patient_photo: row[7],
                created_at: new Date(row[8].replace(" UTC", "+00:00")),
            }));

            console.log("patients: ", patients);
            setPatientData(patients);
        } catch (error) {
            console.error("Error fetching patient data:", error);
        }
    };

    useEffect(() => {
        fetchPatientData();
    }, []);

    return (
        <Box sx={{ p: 3 }}>
            <Appointments />
            <Typography variant="h4" sx={{ mb: 3 }}>
                Patient List
            </Typography>
            
            <Grid container spacing={3}>
                {patientData.map((patient) => (
                    <Grid item xs={12} key={patient.patient_id}>
                        <Paper sx={{ p: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6">
                                        {patient.first_name} {patient.last_name}
                                    </Typography>
                                    <Typography color="textSecondary">
                                        MR#: {patient.mr_number}
                                    </Typography>
                                    <Typography>
                                        Gender: {patient.gender}
                                    </Typography>
                                    <Typography>
                                        DOB: {patient.date_of_birth.toLocaleDateString()}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography>
                                        Appointment: {patient.appointment_time.toLocaleString()}
                                    </Typography>
                                    <Typography color="textSecondary">
                                        Created: {patient.created_at.toLocaleString()}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default ConsultantPage;
