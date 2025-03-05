// src/pages/ConsultantPage.tsx

// Dependencies
import { Box, Typography, useTheme } from '@mui/material';
import Appointments from '../components/Appointments';
import PatientList from '../components/PatientList';
import { useState } from 'react';
import UpdateComponent from '../components/UpdateComponent';
import CustomButton from '../common-components/CustomButton';
import { useDispatch } from 'react-redux';
import { clearCredentials } from '../redux/auth/authSlice';

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
    const theme = useTheme();
    const dispatch = useDispatch();

    const [update, setUpdate] = useState<any>(null);

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
            <UpdateComponent />
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                }}
            >
                <Box>
                    <CustomButton onClick={() => dispatch(clearCredentials())}>
                        Logout
                    </CustomButton>
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
            <Box
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
            </Box>
        </Box>
    );
};

export default ConsultantPage;
