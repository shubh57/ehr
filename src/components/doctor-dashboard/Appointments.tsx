import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { invoke } from '@tauri-apps/api/core';
import {
    Box,
    Typography,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Modal,
    Paper,
    Slider,
} from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { UserInterface } from '../../redux/auth/interfaces';
import { useQuery, useQueryClient } from 'react-query';

export type Appointment = {
    appointment_id: number;
    description: string;
    appointment_time: string;
    appointment_duration: number;
    created_by: number;
    created_at: string;
    doctor_id: number;
};

const fetchAppointments = async (token: string): Promise<Appointment[]> => {
    return await invoke<Appointment[]>('get_appointments', { token });
};

const fetchDoctors = async (token: string): Promise<UserInterface[]> => {
    return await invoke<UserInterface[]>('get_all_doctors', { token });
};

const Appointments: React.FC = () => {
    const { token, user } = useSelector((state: RootState) => state.auth);
    const queryClient = useQueryClient();

    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [doctors, setDoctors] = useState<UserInterface[]>([]);
    const [selectedDoctors, setSelectedDoctors] = useState<number[]>([]);
    const [appointmentSending, setAppointmentSending] = useState<boolean>(false);
    const [description, setDescription] = useState<string>('');
    const [appointmentTime, setAppointmentTime] = useState<Date | null>(null);
    const [appointmentDuration, setAppointmentDuration] = useState<number>(30);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [showCalendar, setShowCalendar] = useState<boolean>(false);

    const appointmentQuery = useQuery<Appointment[], Error>(['appointments', user?.user_id], () => fetchAppointments(token || ""));
    const appointmentsLoading = appointmentQuery.isLoading;

    const doctorsQuery = useQuery<UserInterface[], Error>(['all_doctors'], () => fetchDoctors(token || ""));

    useEffect(() => {
        if (appointmentQuery.data) {
            setAppointments(appointmentQuery.data);
        }
    }, [appointmentQuery.data]);

    useEffect(() => {
        if (doctorsQuery.data) {
            setDoctors(doctorsQuery.data.filter(doctor => doctor.user_id != user?.user_id));
        }
    }, [doctorsQuery.data])

    const createAppointment = async () => {
        try {
            if (!description || !appointmentTime || selectedDoctors.length === 0) {
                alert('Please fill in all required fields');
                return;
            }

            if (!user) {
                return;
            }

            let doctors = [...new Set(selectedDoctors), user.user_id];
            doctors = [...new Set(doctors)];
            console.log('doctors: ', doctors);

            setAppointmentSending(true);
            const data = await invoke('create_appointment', {
                token,
                description,
                appointmentTime: appointmentTime.toISOString(),
                appointmentDuration,
                users: doctors,
            });
            setDescription('');
            setAppointmentTime(null);
            setAppointmentDuration(30);
            setSelectedDoctors([]);
            queryClient.invalidateQueries(['appointments', user?.user_id]);
            setModalOpen(false);
        } catch (error) {
            console.error('Error while creating appointment: ', error);
        } finally {
            setAppointmentSending(false);
        }
    };

    const getDoctorAppointments = (doctorIds: number[]) => {
        return appointments
            .filter((app) => doctorIds.includes(app.doctor_id))
            .map((app) => ({
                id: app.appointment_id.toString(),
                title: `${app.description} (Dr. ${doctors.find((d) => d.user_id === app.doctor_id)?.last_name})`,
                start: new Date(app.appointment_time),
                end: new Date(new Date(app.appointment_time).getTime() + app.appointment_duration * 60000),
                backgroundColor: '#b3e5fc',
                borderColor: '#03a9f4',
            }));
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant='h4' gutterBottom>
                Appointments
            </Typography>

            {/* Appointments List */}
            <Paper elevation={3} sx={{ p: 3, mb: 3, maxHeight: '12rem', overflowY: 'scroll' }}>
                <Typography variant='h6' gutterBottom>
                    Scheduled Appointments
                </Typography>
                {appointmentsLoading ? (
                    <CircularProgress />
                ) : (
                    <List>
                        {appointments.length === 0 ? (
                            <Typography>No appointments found.</Typography>
                        ) : (
                            appointments.map((appointment) => (
                                <ListItem key={appointment.appointment_id}>
                                    <ListItemText
                                        primary={appointment.description}
                                        secondary={`
                                            Time: ${new Date(appointment.appointment_time).toLocaleString('en-IN')}
                                            Duration: ${(appointment.appointment_duration as number) / 1_000_000} minutes
                                        `}
                                    />
                                </ListItem>
                            ))
                        )}
                    </List>
                )}
            </Paper>

            {/* Create Appointment Button */}
            <Button variant='contained' onClick={() => setModalOpen(true)}>
                Create Appointment
            </Button>

            {/* Create Appointment Modal */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <Paper
                    elevation={3}
                    sx={{
                        p: 3,
                        mx: 'auto',
                        mt: '10%',
                        width: '70%',
                        maxWidth: 800,
                    }}
                >
                    <Typography variant='h6' gutterBottom>
                        Create New Appointment
                    </Typography>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Select Doctors</InputLabel>
                        <Select multiple value={selectedDoctors} onChange={(e) => setSelectedDoctors(e.target.value as number[])}>
                            {doctors.map((doctor) => (
                                <MenuItem key={doctor.user_id} value={doctor.user_id}>
                                    Dr. {doctor.first_name} {doctor.last_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField fullWidth label='Description' value={description} onChange={(e) => setDescription(e.target.value)} sx={{ mb: 2 }} />

                    {showCalendar ? (
                        <Box
                            sx={{
                                border: '1px solid #ddd',
                                borderRadius: 1,
                                p: 1,
                                mb: 2,
                                height: 400,
                                overflow: 'scroll',
                            }}
                        >
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView='timeGridDay'
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'timeGridWeek,timeGridDay',
                                }}
                                events={getDoctorAppointments(selectedDoctors)}
                                height='100%'
                                contentHeight='auto'
                                dateClick={(info) => {
                                    setAppointmentTime(new Date(info.date));
                                    setShowCalendar(false);
                                }}
                                eventColor='#b3e5fc'
                                slotDuration='01:00:00'
                                slotLabelInterval='01:00:00'
                                allDaySlot={false}
                            />
                        </Box>
                    ) : (
                        <Button variant='outlined' onClick={() => setShowCalendar(true)} disabled={selectedDoctors.length === 0} sx={{ mb: 2 }}>
                            {selectedDoctors.length > 0 ? 'Select Appointment Time' : 'Select doctors first'}
                        </Button>
                    )}

                    {appointmentTime && <Typography sx={{ mb: 2 }}>Selected Time: {appointmentTime.toLocaleString('en-IN')}</Typography>}

                    <Box sx={{ mb: 2 }}>
                        <Typography id='duration-slider' gutterBottom>
                            Duration: {appointmentDuration} minutes
                        </Typography>
                        <Slider
                            value={appointmentDuration}
                            onChange={(e: Event, newValue: number | number[]) => setAppointmentDuration(newValue as number)}
                            aria-labelledby='duration-slider'
                            valueLabelDisplay='auto'
                            step={15}
                            marks
                            min={15}
                            max={120}
                        />
                    </Box>

                    <Button variant='contained' onClick={createAppointment} disabled={appointmentSending}>
                        {appointmentSending ? <CircularProgress size={24} /> : 'Create Appointment'}
                    </Button>
                </Paper>
            </Modal>
        </Box>
    );
};

export default Appointments;
