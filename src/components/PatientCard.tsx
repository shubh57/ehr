// src/components/PatientCard.tsx

import React, { useEffect, useState } from 'react';
import { Patient } from '../pages/ConsultantPage';
import { Box, Typography, Avatar, useTheme, CircularProgress } from '@mui/material';
import { invoke } from '@tauri-apps/api/core';

interface PatientCardProps {
    patient_id: number;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient_id }) => {
    const theme = useTheme();
    const [patientData, setPatientData] = useState<Patient>();
    const [isLoading, setIsLoading] = useState(false);

    const fetchPatientData = async (patient_id: number) => {
        try {
            setIsLoading(true);
            const data: Patient = await invoke('get_patient_data', { patientId: patient_id });
            setPatientData(data);
        } catch (error) {
            console.error('Error fetching patient data:', error);
        } finally {
            setIsLoading(false);
        }
    };

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
        fetchPatientData(patient_id);
    }, [patient_id]);

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
                            {new Date(patientData?.created_at || Date.now()).toLocaleDateString('en-GB')}
                        </Typography>
                    </Box>
                </>
            )}
        </Box>
    );
};

export default PatientCard;
