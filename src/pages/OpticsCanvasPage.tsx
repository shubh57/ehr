// src/pages/OpticsCanvasPage.tsx

// Dependencies
import React from 'react';
import Canvas from '../components/Canvas';
import { Box, Button, Paper, Typography, useTheme } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

const OpticsCanvasPage: React.FC = () => {
    const { patient_id } = useParams();
    const theme = useTheme();
    const patientId = parseInt(patient_id || '0');
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                padding: '12px',
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
                {/* Back Arrow and MR Number Section */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3rem',
                    }}
                >
                    <ArrowBack onClick={() => navigate(`/patient_optics/${patientId}`)} style={{ cursor: 'pointer' }} />
                    {/* {patientDataLoading ? (
                        <CircularProgress />
                    ) : (
                        <Paper
                            elevation={3}
                            sx={{
                                padding: '10px 20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                            }}
                        >
                            <ListItemAvatar>
                                <Avatar
                                    sx={{
                                        bgcolor: patientData?.gender === 'MALE' ? '#2196f3' : '#ec407a',
                                        width: theme.spacing(10),
                                        height: theme.spacing(10),
                                    }}
                                    src={patientData?.patient_photo}
                                >
                                    {`${patientData?.first_name[0]}${patientData?.last_name[0]}`}
                                </Avatar>
                            </ListItemAvatar>
                            <Box>
                                <Typography variant='h6'>{`${patientData?.first_name} ${patientData?.last_name}`}</Typography>
                                <Typography variant='subtitle1'>{`${patientData?.gender[0]}/${calculateAge(patientData?.date_of_birth || '')}`}</Typography>
                            </Box>
                        </Paper>
                    )} */}
                </Box>

                {/* Centered Title */}
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
                        Canvas
                    </Typography>
                </Box>

                {/* Patient Info Section */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}
                >
                    {/* {patientData && (
                        <Paper
                            elevation={3}
                            sx={{
                                padding: '10px 20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                            }}
                        >
                            <Typography variant='h6'>MR Number: {patientData?.mr_number}</Typography>
                        </Paper>
                    )} */}
                </Box>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                }}
            >
                <Canvas />
            </Box>
        </Box>
    );
};

export default OpticsCanvasPage;
