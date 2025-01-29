import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    TableSortLabel,
    Divider,
    Avatar,
    useTheme,
    Card,
    CardContent,
} from '@mui/material';
import {
    CalendarToday as CalendarIcon,
    Person as PersonIcon,
    Assignment as AssignmentIcon,
    Note as NoteIcon,
    EventBusy as NoAppointmentsIcon,
    Schedule as TimeIcon,
    MedicalInformation as MedicalIcon,
} from '@mui/icons-material';

export type AppointmentData = {
    patient_id: number;
    mr_number: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: string;
    patient_photo: string;
    created_at: string;
    activity_id: number;
    status: string;
    activity: string;
    doctors_note: string;
    patient_complaint: string;
    activity_time: string;
    activity_created_at: string;
};

const Appointments = () => {
    const [appointmentData, setAppointmentData] = useState<AppointmentData[]>([]);
    const theme = useTheme();

    const fetchAppointmentData = async () => {
        try {
            const data: AppointmentData[] = await invoke('get_appointment_data');
            setAppointmentData(data);
        } catch (error) {
            console.error('Error fetching appointment data:', error);
        }
    };

    const calculateAge = (birthDate: Date) => {
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            return age - 1;
        }
        return age;
    };

    useEffect(() => {
        fetchAppointmentData();
    }, []);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                padding: '16px',
                backgroundColor: theme.palette.secondary.main,
                borderRadius: '8px',
                boxShadow: theme.shadows[2],
                gap: '2rem',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flex: 1,
                    width: '100%',
                }}
            >
                <Typography
                    variant='h4'
                    sx={{
                        mb: 4,
                        fontWeight: 'bold',
                        color: '#2c3e50',
                    }}
                >
                    Appointments
                </Typography>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    width: '100%',
                }}
            >
                <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, width: '100%' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ width: '15%', fontWeight: 'bold' }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                        }}
                                    >
                                        <TimeIcon sx={{ color: theme.palette.primary.main }} />
                                        <Typography variant='subtitle2'>Appointment Time</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ width: '25%', fontWeight: 'bold' }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                        }}
                                    >
                                        <PersonIcon sx={{ color: theme.palette.success.main }} />
                                        <Typography variant='subtitle2'>Patient Information</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ width: '25%', fontWeight: 'bold' }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                        }}
                                    >
                                        <MedicalIcon sx={{ color: theme.palette.info.main }} />
                                        <Typography variant='subtitle2'>Reason for Visit</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ width: '20%', fontWeight: 'bold' }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                        }}
                                    >
                                        <AssignmentIcon sx={{ color: theme.palette.warning.main }} />
                                        <Typography variant='subtitle2'>Activity</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ width: '15%', fontWeight: 'bold' }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                        }}
                                    >
                                        <NoteIcon sx={{ color: theme.palette.secondary.main }} />
                                        <Typography variant='subtitle2'>Doctor's Note</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {appointmentData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5}>
                                        <Card
                                            elevation={0}
                                            sx={{
                                                backgroundColor: 'transparent',
                                                width: '100%',
                                                minHeight: '300px',
                                            }}
                                        >
                                            <CardContent>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        padding: '3rem',
                                                        gap: '1.5rem',
                                                    }}
                                                >
                                                    <NoAppointmentsIcon
                                                        sx={{
                                                            fontSize: '4rem',
                                                            color: theme.palette.text.secondary,
                                                            opacity: 0.8,
                                                        }}
                                                    />
                                                    <Box sx={{ textAlign: 'center' }}>
                                                        <Typography
                                                            variant='h5'
                                                            color='text.secondary'
                                                            sx={{
                                                                fontWeight: 600,
                                                                mb: 1,
                                                            }}
                                                        >
                                                            No Appointments Today
                                                        </Typography>
                                                        <Typography variant='body1' color='text.secondary' sx={{ opacity: 0.8 }}>
                                                            There are no scheduled appointments for today
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                appointmentData.map((appointment) => (
                                    <TableRow
                                        key={`${appointment.patient_id}-${appointment.activity_id}`}
                                        hover
                                        sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}
                                    >
                                        {/* Appointment Time */}
                                        <TableCell>
                                            <Typography
                                                sx={{
                                                    fontSize: '20px',
                                                    fontWeight: '500',
                                                }}
                                            >
                                                {appointment.activity_time ? new Date(appointment.activity_time).toLocaleTimeString() : 'N/A'}
                                            </Typography>
                                        </TableCell>

                                        {/* Patient Information */}
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar
                                                    sx={{
                                                        bgcolor: appointment.gender === 'MALE' ? '#1976d2' : '#d81b60',
                                                        width: 40,
                                                        height: 40,
                                                    }}
                                                >
                                                    {`${appointment.first_name[0]}${appointment.last_name[0]}`}
                                                </Avatar>
                                                <Box>
                                                    <Typography>
                                                        {appointment.first_name} {appointment.last_name}
                                                    </Typography>
                                                    <Typography color='textSecondary' variant='body2'>
                                                        MR#: {appointment.mr_number}
                                                    </Typography>
                                                    <Box sx={{ mt: 1 }}>
                                                        <Chip
                                                            label={appointment.gender}
                                                            size='small'
                                                            sx={{
                                                                mr: 1,
                                                                backgroundColor: appointment.gender === 'MALE' ? '#e3f2fd' : '#fce4ec',
                                                                color: appointment.gender === 'MALE' ? '#1976d2' : '#d81b60',
                                                            }}
                                                        />
                                                        <Chip label={`${calculateAge(new Date(appointment.date_of_birth))} years`} size='small' />
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </TableCell>

                                        {/* Patient Complaint */}
                                        <TableCell>
                                            <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap' }}>
                                                {appointment.patient_complaint || 'No complaint recorded'}
                                            </Typography>
                                        </TableCell>

                                        {/* Activity */}
                                        <TableCell>
                                            <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap' }}>
                                                {appointment.activity || 'No activity recorded'}
                                            </Typography>
                                        </TableCell>

                                        {/* Doctor's Note */}
                                        <TableCell>
                                            <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap' }}>
                                                {appointment.doctors_note || 'No notes available'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
};

export default Appointments;
