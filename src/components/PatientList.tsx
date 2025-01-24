// src/components/PatientList.tsx

import { 
    Box, Typography, Avatar, useTheme, CircularProgress,
    List, ListItem, ListItemAvatar, ListItemText, Divider,
    Card, CardContent, Chip
} from '@mui/material';
import { 
    Person as PersonIcon,
    EventNote as DateIcon,
    Assignment as MRIcon,
    Wc as GenderIcon
} from '@mui/icons-material';
import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
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

const PatientList: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [patientData, setPatientData] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(false);

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

    const fetchPatientData = async () => {
        try {
            setIsLoading(true);
            const patients: Patient[] = await invoke('get_patients_data');
            setPatientData(patients);
        } catch (error) {
            console.error('Error fetching patient data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPatientData();
    }, []);

    // Modern gender-based colors
    const genderColors = {
        male: {
            light: '#e3f2fd', // Light blue background
            main: '#2196f3',  // Modern blue
            text: '#1976d2'   // Darker blue for text
        },
        female: {
            light: '#fce4ec', // Light pink background
            main: '#ec407a',  // Modern pink
            text: '#d81b60'   // Darker pink for text
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                backgroundColor: theme.palette.background.paper,
                borderRadius: theme.shape.borderRadius,
                boxShadow: theme.shadows[2],
            }}
        >
            <Box
                sx={{
                    p: 3,  // Increased padding
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,  // Increased gap
                }}
            >
                <PersonIcon color="primary" sx={{ fontSize: '1.5rem' }} />
                <Typography variant="h6" fontWeight="bold">
                    Patient List
                </Typography>
            </Box>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : patientData.length === 0 ? (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 6,  // Increased padding
                        gap: 2,
                    }}
                >
                    <PersonIcon sx={{ fontSize: '3rem', color: 'text.secondary' }} />
                    <Typography variant="h6" color="text.secondary">
                        No patients found
                    </Typography>
                </Box>
            ) : (
                <List sx={{ width: '100%', p: 0 }}>
                    {patientData.map((patient, index) => (
                        <React.Fragment key={patient.patient_id}>
                            <ListItem 
                                sx={{ 
                                    py: 2.5,  // Vertical padding
                                    px: 3,    // Horizontal padding
                                    '&:hover': {
                                        backgroundColor: theme.palette.action.hover,
                                    },
                                }}
                            >
                                <Box>
                                    <ListItemAvatar>
                                        <Avatar
                                            sx={{
                                                bgcolor: patient.gender === 'MALE' ? 
                                                    genderColors.male.main : 
                                                    genderColors.female.main,
                                                width: theme.spacing(10),
                                                height: theme.spacing(10),
                                            }}
                                            src={patient.patient_photo}
                                        >
                                            {`${patient.first_name[0]}${patient.last_name[0]}`}
                                        </Avatar>
                                    </ListItemAvatar>
                                </Box>
                                <Box sx={{ ml: 3, flex: 1 }}>
                                    <Box 
                                        sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5, cursor: 'pointer' }}
                                        onClick={() => navigate(`/patient_details/${patient.patient_id}`)}
                                    >
                                        <Typography variant="h6">
                                            {`${patient.first_name} ${patient.last_name}`}
                                        </Typography>
                                        <Chip
                                            size="small"
                                            label={patient.gender}
                                            sx={{
                                                backgroundColor: patient.gender === 'MALE' ? 
                                                    genderColors.male.light : 
                                                    genderColors.female.light,
                                                color: patient.gender === 'MALE' ? 
                                                    genderColors.male.text : 
                                                    genderColors.female.text,
                                                fontWeight: 500,
                                                px: 1,
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 4 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <MRIcon 
                                                fontSize="small" 
                                                sx={{ color: theme.palette.text.secondary }} 
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                {patient.mr_number}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <DateIcon 
                                                fontSize="small" 
                                                sx={{ color: theme.palette.text.secondary }} 
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                {`${calculateAge(patient.date_of_birth)} years`}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </ListItem>
                            {index < patientData.length - 1 && (
                                <Divider sx={{ mx: 3 }} />  // Added margin to divider
                            )}
                        </React.Fragment>
                    ))}
                </List>
            )}
        </Box>
    );
};

export default PatientList;