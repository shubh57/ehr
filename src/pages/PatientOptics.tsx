// src/pages/PatientOptics.tsx

// Dependencies
import { ArrowBack } from '@mui/icons-material';
import {
    Avatar,
    Box,
    Chip,
    CircularProgress,
    ListItemAvatar,
    Typography,
    useTheme,
    Paper,
    CardContent,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Patient } from './ConsultantPage';
import { useToast } from '@chakra-ui/react';
import { invoke } from '@tauri-apps/api/core';
import PatientVision from '../components/optics/PatientVision';
import PatientRefraction from '../components/optics/PatientRefraction';
import ConsoleBox from '../components/optics/ConsoleBox';
import ChiefComplaints from '../components/optics/ChiefComplaints';
import EyeMeasurement from '../components/optics/EyeMeasurement';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import PrescriptionDocument from '../components/optics/PrescriptionDocument';
import { documentDir, downloadDir } from '@tauri-apps/api/path';

const PatientOptics: React.FC = () => {
    const { patient_id } = useParams();
    const theme = useTheme();
    const navigate = useNavigate();
    const toast = useToast();
    const patientId = parseInt(patient_id || '0');
    const swipeHandled = useRef(false);

    const [patientData, setPatientData] = useState<Patient>();
    const [patientDataLoading, setPatientDataLoading] = useState<boolean>(false);
    const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState<boolean>(false);

    useEffect(() => {
        const handleWheel = (e: any) => {
            if (swipeHandled.current) {
                return;
            }
            e.preventDefault();

            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                const threshold = 20;
                if (e.deltaX > threshold) {
                    swipeHandled.current = true;
                    navigate(`/patient_details/${patient_id}`);

                    setTimeout(() => {
                        swipeHandled.current = false;
                    }, 50000);
                } else if (e.deltaX < -threshold) {
                    swipeHandled.current = true;
                    navigate(`/patient_procedure/${patient_id}`);

                    setTimeout(() => {
                        swipeHandled.current = false;
                    }, 50000);
                }
            }
        };

        const handleKeyDown = (e: any) => {
            if (e.key === 'ArrowLeft') {
                navigate(`/patient_procedure/${patient_id}`);
            } else if (e.key === 'ArrowRight') {
                navigate(`/patient_details/${patient_id}`);
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

    const fetchPatientData = async () => {
        try {
            setPatientDataLoading(true);
            const data: Patient = await invoke('get_patient_data', { patientId: patientId });
            setPatientData(data);
        } catch (error) {
            console.error('Error while fetching patient data: ', error);
            toast({
                title: `Error while fetching patient data: ${error}`,
                status: 'error',
                duration: 4000,
                isClosable: true,
                position: 'top',
            });
        } finally {
            setPatientDataLoading(false);
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

    const handlePrescriptionClick = () => {
        setPrescriptionDialogOpen(true);
    };

    const handleClosePrescriptionDialog = () => {
        setPrescriptionDialogOpen(false);
    };

    const handleDownloadPdf = async (blob: Blob | null) => {
        if (!blob) {
            return;
        }

        const downloadPath = await downloadDir();
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        let binaryString = "";
        for (let i = 0; i < uint8Array.length; i++) {
            binaryString += String.fromCharCode(uint8Array[i]);
        }
        const base64String = btoa(binaryString);

        const fileName = `glass_prescription_${patientData?.mr_number || 'patient'}.pdf`;

        try {
            await invoke ('save_pdf_file', { fileName, base64Data: base64String, downloadPath: downloadPath });
            toast({
                title: 'Prescription downloaded successfully.',
                status: 'success',
                duration: 4000,
                isClosable: true,
                position: 'top',
            });
            setPrescriptionDialogOpen(false);
        } catch (error) {
            console.error("Error while saving pdf file: ", error);
            toast({
                title: 'Error while downloading prescription.',
                status: 'error',
                duration: 4000,
                isClosable: true,
                position: 'top',
            });
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
                    <ArrowBack onClick={() => navigate(`/patient_details/${patientId}`)} style={{ cursor: 'pointer' }} />
                    {patientDataLoading ? (
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
                    )}
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
                        Patient Optics
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
                    {patientData && (
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
                    )}
                    <Button
                        variant='contained'
                        onClick={() => navigate(`/optics_canvas/${patientId}`)}
                        sx={{ alignSelf: 'flex-start', marginTop: '8px', backgroundColor: theme.palette.common.black, color: theme.palette.common.white }}
                    >
                        Canvas
                    </Button>
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={handlePrescriptionClick}
                        sx={{
                            alignSelf: 'flex-start',
                            marginTop: '8px',
                            backgroundColor: '#4caf50',
                            '&:hover': {
                                backgroundColor: '#388e3c',
                            },
                        }}
                    >
                        Glass Prescription
                    </Button>
                </Box>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    height: '30%',
                    gap: '0.5rem',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        height: '100%',
                        maxWidth: '9%',
                    }}
                >
                    <PatientVision patient_id={patientId} side='RIGHT' value_type='UC' />
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        height: '100%',
                        maxWidth: '18%',
                    }}
                >
                    <PatientRefraction patient_id={patientId} side='RIGHT' />
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        height: '100%',
                        maxWidth: '9%',
                    }}
                >
                    <PatientVision patient_id={patientId} side='RIGHT' value_type='BCVA' />
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        height: '100%',
                        maxWidth: '20%',
                    }}
                >
                    <ConsoleBox />
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        height: '100%',
                        maxWidth: '9%',
                    }}
                >
                    <PatientVision patient_id={patientId} side='LEFT' value_type='UC' />
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        height: '100%',
                        maxWidth: '18%',
                    }}
                >
                    <PatientRefraction patient_id={patientId} side='LEFT' />
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        height: '100%',
                        maxWidth: '9%',
                    }}
                >
                    <PatientVision patient_id={patientId} side='LEFT' value_type='BCVA' />
                </Box>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    gap: '0.5rem',
                    marginTop: '2rem',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '40%',
                        heigth: '100%',
                    }}
                >
                    <CardContent sx={{ p: 2, width: '100%' }}>
                        <Box display='flex' flexDirection='column' gap={1.5} width='100%'>
                            <Typography variant='body2' fontWeight='bold' color='text.secondary'>
                                Findings (R)
                            </Typography>

                            <TextField
                                multiline
                                rows={3}
                                placeholder='Enter findings here...'
                                variant='outlined'
                                fullWidth
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        backgroundColor: 'action.hover',
                                        '&:hover': {
                                            backgroundColor: 'action.selected',
                                        },
                                        '& fieldset': {
                                            borderColor: 'divider',
                                        },
                                    },
                                }}
                            />
                        </Box>
                    </CardContent>

                    <CardContent sx={{ p: 2, width: '100%' }}>
                        <Box display='flex' flexDirection='column' gap={1.5} width='100%'>
                            <Typography variant='body2' fontWeight='bold' color='text.secondary'>
                                Diagnosis (R)
                            </Typography>

                            <TextField
                                multiline
                                rows={3}
                                placeholder='Enter diagnosis here...'
                                variant='outlined'
                                fullWidth
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        backgroundColor: 'action.hover',
                                        '&:hover': {
                                            backgroundColor: 'action.selected',
                                        },
                                        '& fieldset': {
                                            borderColor: 'divider',
                                        },
                                    },
                                }}
                            />
                        </Box>
                    </CardContent>

                    <CardContent sx={{ p: 2, width: '100%' }}>
                        <Box display='flex' flexDirection='column' gap={1.5} width='100%'>
                            <Typography variant='body2' fontWeight='bold' color='text.secondary'>
                                Advice
                            </Typography>

                            <TextField
                                multiline
                                rows={3}
                                placeholder='Enter advice here...'
                                variant='outlined'
                                fullWidth
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        backgroundColor: 'action.hover',
                                        '&:hover': {
                                            backgroundColor: 'action.selected',
                                        },
                                        '& fieldset': {
                                            borderColor: 'divider',
                                        },
                                    },
                                }}
                            />
                        </Box>
                    </CardContent>
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '40%',
                        heigth: '100%',
                    }}
                >
                    <CardContent sx={{ p: 2, width: '100%' }}>
                        <Box display='flex' flexDirection='column' gap={1.5} width='100%'>
                            <Typography variant='body2' fontWeight='bold' color='text.secondary'>
                                Findings (L)
                            </Typography>

                            <TextField
                                multiline
                                rows={3}
                                placeholder='Enter findings here...'
                                variant='outlined'
                                fullWidth
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        backgroundColor: 'action.hover',
                                        '&:hover': {
                                            backgroundColor: 'action.selected',
                                        },
                                        '& fieldset': {
                                            borderColor: 'divider',
                                        },
                                    },
                                }}
                            />
                        </Box>
                    </CardContent>

                    <CardContent sx={{ p: 2, width: '100%' }}>
                        <Box display='flex' flexDirection='column' gap={1.5} width='100%'>
                            <Typography variant='body2' fontWeight='bold' color='text.secondary'>
                                Diagnosis (L)
                            </Typography>

                            <TextField
                                multiline
                                rows={3}
                                placeholder='Enter diagnosis here...'
                                variant='outlined'
                                fullWidth
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        backgroundColor: 'action.hover',
                                        '&:hover': {
                                            backgroundColor: 'action.selected',
                                        },
                                        '& fieldset': {
                                            borderColor: 'divider',
                                        },
                                    },
                                }}
                            />
                        </Box>
                    </CardContent>

                    <CardContent sx={{ p: 2, width: '100%' }}>
                        <Box display='flex' flexDirection='column' gap={1.5} width='100%'>
                            <Typography variant='body2' fontWeight='bold' color='text.secondary'>
                                Advice
                            </Typography>

                            <TextField
                                multiline
                                rows={3}
                                placeholder='Enter advice here...'
                                variant='outlined'
                                fullWidth
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        backgroundColor: 'action.hover',
                                        '&:hover': {
                                            backgroundColor: 'action.selected',
                                        },
                                        '& fieldset': {
                                            borderColor: 'divider',
                                        },
                                    },
                                }}
                            />
                        </Box>
                    </CardContent>
                </Box>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100%',
                    gap: '0.5rem',
                }}
            >
                <Box
                    sx={{
                        width: '40%',
                    }}
                >
                    <ChiefComplaints patient_id={patientId} />
                </Box>
                <Box
                    sx={{
                        width: '20%',
                    }}
                >
                    <EyeMeasurement patient_id={patientId} />
                </Box>
                <Box
                    sx={{
                        width: '38%',
                    }}
                ></Box>
            </Box>

            {/* Prescription Dialog */}
            <Dialog open={prescriptionDialogOpen} onClose={handleClosePrescriptionDialog} aria-labelledby='prescription-dialog-title' maxWidth='md' fullWidth>
                <DialogTitle id='prescription-dialog-title'>Glass Prescription</DialogTitle>
                <DialogContent>
                    <Box sx={{ height: 600 }}>
                        <PDFViewer width='100%' height='100%' style={{ border: 'none' }}>
                            <PrescriptionDocument patient_id={patientId} />
                        </PDFViewer>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleClosePrescriptionDialog}
                        variant='contained'
                        sx={{
                            backgroundColor: theme.palette.background.paperDark,
                        }}
                    >
                        Close
                    </Button>
                    <PDFDownloadLink
                        document={<PrescriptionDocument patient_id={patientId} />}
                        fileName={`glass_prescription_${patientData?.mr_number || 'patient'}.pdf`}
                        style={{
                            textDecoration: 'none',
                        }}
                    >
                        {({ blob, url, loading, error }) => (
                            <Button variant='contained' color='primary' disabled={loading} onClick={async() => await handleDownloadPdf(blob)}>
                                {loading ? 'Preparing document...' : 'Download PDF'}
                            </Button>
                        )}
                    </PDFDownloadLink>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PatientOptics;
