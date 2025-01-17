import React, {useState, useEffect} from "react";
import { invoke } from "@tauri-apps/api/core";
import { 
    Box, 
    Typography, 
    Grid,
    Card,
    CardContent,
    Chip,
} from '@mui/material';
import { 
    CalendarToday as CalendarIcon,
    Person as PersonIcon,
    Assignment as AssignmentIcon,
    Note as NoteIcon
} from '@mui/icons-material';

export type AppointmentData = {
    patient_id: number,
    mr_number: string,
    first_name: string,
    last_name: string,
    date_of_birth: string,
    gender: string,
    appointment_time: string,
    patient_photo: string,
    created_at: string,
    activity_id: number,
    status: string,
    activity: string,
    doctors_note: string,
    activity_time: string,
    activity_created_at: string,
};

const Appointments = () => {

    const [appointmentData, setAppointmentData] = useState<AppointmentData[]>([]);

    const fetchAppointmentData = async () => {
        try {
            const data: AppointmentData[] = await invoke("get_appointment_data");
            setAppointmentData(data);
            data.forEach((appointment) => {(
                console.log("appointment: ", appointment));
            });
        } catch (error) {
            console.error("Error fetching appointment data:", error);
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
            variant="h4" 
            sx={{ 
                mb: 4, 
                fontWeight: 'bold',
                color: '#2c3e50'
            }}
        >
            Appointments
        </Typography>

        <Grid container spacing={3}>
            {appointmentData.map((appointment) => (
                <Grid item xs={12} key={`${appointment.patient_id}-${appointment.activity_id}`}>
                    <Card 
                        elevation={2}
                        sx={{
                            '&:hover': {
                                boxShadow: 6,
                                transition: 'box-shadow 0.3s ease-in-out'
                            }
                        }}
                    >
                        <CardContent>
                            <Grid container spacing={2}>
                                {/* Date and Time Section */}
                                <Grid item xs={12} md={3}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <CalendarIcon sx={{ mr: 1, color: '#3498db' }} />
                                        <Typography variant="h6">
                                            {appointment.appointment_time ? new Date(appointment.appointment_time).toLocaleDateString() : 'N/A'}
                                        </Typography>
                                    </Box>
                                    <Typography color="textSecondary">
                                        {appointment.appointment_time ? new Date(appointment.appointment_time).toLocaleTimeString() : 'N/A'}
                                    </Typography>
                                </Grid>

                                {/* Patient Info Section */}
                                <Grid item xs={12} md={3}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <PersonIcon sx={{ mr: 1, color: '#2ecc71' }} />
                                        <Typography variant="h6">
                                            {appointment.first_name} {appointment.last_name}
                                        </Typography>
                                    </Box>
                                    <Typography color="textSecondary">
                                        MR#: {appointment.mr_number}
                                    </Typography>
                                    <Box sx={{ mt: 1 }}>
                                        <Chip 
                                            label={appointment.gender} 
                                            size="small" 
                                            sx={{ mr: 1 }}
                                        />
                                        <Chip 
                                            label={`${calculateAge(new Date(appointment.date_of_birth))} years`}
                                            size="small"
                                        />
                                    </Box>
                                </Grid>

                                {/* Activity Section */}
                                <Grid item xs={12} md={3}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <AssignmentIcon sx={{ mr: 1, color: '#e74c3c' }} />
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            Activity
                                        </Typography>
                                    </Box>
                                    <Typography>
                                        {appointment.activity || 'No activity recorded'}
                                    </Typography>
                                </Grid>

                                {/* Doctor's Note Section */}
                                <Grid item xs={12} md={3}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <NoteIcon sx={{ mr: 1, color: '#9b59b6' }} />
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            Doctor's Note
                                        </Typography>
                                    </Box>
                                    <Typography>
                                        {appointment.doctors_note || 'No notes available'}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    </Box>
);
};

export default Appointments;