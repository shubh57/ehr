import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, TableSortLabel, Divider, Avatar } from '@mui/material';
import { CalendarToday as CalendarIcon, Person as PersonIcon, Assignment as AssignmentIcon, Note as NoteIcon } from '@mui/icons-material';

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
        <Box sx={{ p: 4, backgroundColor: '#f5f5f5' }}>
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

            <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: '15%', fontWeight: 'bold' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CalendarIcon sx={{ mr: 1, color: '#3498db' }} />
                                    Appointment Time
                                </Box>
                            </TableCell>
                            <TableCell sx={{ width: '25%', fontWeight: 'bold' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <PersonIcon sx={{ mr: 1, color: '#2ecc71' }} />
                                    Patient Information
                                </Box>
                            </TableCell>
                            <TableCell sx={{ width: '25%', fontWeight: 'bold' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <NoteIcon sx={{ mr: 1, color: '#3498db' }} />
                                    Reason for Visit
                                </Box>
                            </TableCell>
                            <TableCell sx={{ width: '20%', fontWeight: 'bold' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <AssignmentIcon sx={{ mr: 1, color: '#e74c3c' }} />
                                    Activity
                                </Box>
                            </TableCell>
                            <TableCell sx={{ width: '15%', fontWeight: 'bold' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <NoteIcon sx={{ mr: 1, color: '#9b59b6' }} />
                                    Doctor's Note
                                </Box>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {appointmentData.map((appointment) => (
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
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default Appointments;
