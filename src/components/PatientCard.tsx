// src/components/PatientCard.tsx

import React, { useEffect, useState } from 'react';
import { Patient } from '../pages/ConsultantPage';
import { Box, Typography, Avatar, useTheme, CircularProgress, Button } from '@mui/material';
import { invoke } from '@tauri-apps/api/core';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';

interface PatientCardProps {
    patient_id: number;
}

const fetchPatientData = async (
    patientId: number
): Promise<Patient> => {
    return await invoke<Patient>('get_patient_data', { patientId });
};

const PatientCard: React.FC<PatientCardProps> = ({ patient_id }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [patientData, setPatientData] = useState<Patient>();

    const patientQuery = useQuery<Patient, Error>(['patient_data', patient_id], () => fetchPatientData(patient_id));
    const isLoading = patientQuery.isLoading;

    const calculateAge = (dob: string) => {
        const birthDate = new Date(dob);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            return age - 1;
        }
        return age;
    };

    useEffect(() => {
        if (patientQuery.data) {
            setPatientData(patientQuery.data);
        }
    }, [patientQuery.data]);

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                padding: '16px',
                backgroundColor: theme.palette.secondary.main,
                borderRadius: '8px',
                boxShadow: theme.shadows[2],
                gap: '2rem',
            }}
        >
            {/* Avatar Section */}
            {isLoading ? (
                <CircularProgress />
            ) : (
                <>
                    <Avatar
                        sx={{
                            width: '120px',
                            height: '120px',
                            fontSize: '48px',
                            backgroundColor: theme.palette.primary.main,
                            color: theme.palette.primary.contrastText,
                            marginRight: '16px',
                        }}
                        src={patientData?.patient_photo || undefined}
                        alt={`${patientData?.first_name || ''} ${patientData?.last_name || ''}`}
                    >
                        {patientData ? `${patientData.first_name.charAt(0)}${patientData.last_name.charAt(0)}`.toUpperCase() : 'P'}
                    </Avatar>

                    {/* Patient Details Section */}
                    <Box sx={{ flex: 1 }}>
                        <Typography variant='h5' fontWeight='bold'>
                            {`${patientData?.first_name || 'First Name'} ${patientData?.last_name || 'Last Name'}`} /{' '}
                            {patientData?.gender === 'MALE' ? 'M' : patientData?.gender === 'FEMALE' ? 'F' : 'Gender'} /{' '}
                            {patientData?.date_of_birth ? calculateAge(patientData.date_of_birth) : 'Age'}
                        </Typography>
                        <Typography variant='body1' color='textSecondary'>
                            {patientData?.mr_number || 'N/A'}
                        </Typography>
                        <Button
                            variant='contained'
                            onClick={() => navigate(`/patient_optics/${patient_id}`)}
                            sx={{ alignSelf: 'flex-start', marginTop: '8px', backgroundColor: theme.palette.common.black, color: theme.palette.common.white }}
                        >
                            Optics
                        </Button>
                    </Box>
                </>
            )}
        </Box>
    );
};

export default PatientCard;
