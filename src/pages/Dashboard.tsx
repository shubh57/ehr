// DashboardMockup.tsx
import React, { useState } from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText, Avatar, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import HelpIcon from '@mui/icons-material/Help';
import BugReportIcon from '@mui/icons-material/BugReport';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PatientList from '../components/PatientList';
import UpdateComponent from '../components/UpdateComponent';
import Header from '../components/doctor-dashboard/Header';
import WeatherWidget from '../components/doctor-dashboard/WeatherWidget';
import InstantMessaging from '../components/doctor-dashboard/InstantMessaging';
import Alerts from '../components/doctor-dashboard/Alerts';
import Appointments from '../components/doctor-dashboard/Appointments';

// A common style for container boxes to simulate a card-like appearance.
const boxStyle = {
    p: 2,
    mb: 2,
    padding: '16px',
    backgroundColor: '#F5F7FA',
    borderRadius: '8px',
    gap: '1rem',
};

// PatientWaitlist: Shows a scrollable list of patients waiting for consultation.
const PatientWaitlist = () => {
    const patients = [
        { id: 1, name: 'Alice Johnson', appointment: '09:00 AM', priority: 'High', photo: 'https://via.placeholder.com/40' },
        { id: 2, name: 'Bob Smith', appointment: '09:30 AM', priority: 'Medium', photo: 'https://via.placeholder.com/40' },
        { id: 3, name: 'Charlie Davis', appointment: '10:00 AM', priority: 'Low', photo: 'https://via.placeholder.com/40' },
        { id: 4, name: 'Diana Ross', appointment: '10:30 AM', priority: 'High', photo: 'https://via.placeholder.com/40' },
        { id: 5, name: 'Ethan Hunt', appointment: '11:00 AM', priority: 'Medium', photo: 'https://via.placeholder.com/40' },
        { id: 6, name: 'Fiona Gallagher', appointment: '11:30 AM', priority: 'Low', photo: 'https://via.placeholder.com/40' },
    ];
    return (
        <Box sx={{ ...boxStyle, maxHeight: '300px', overflowY: 'auto' }}>
            <Typography variant='h6' mb={1}>
                Patient Waitlist
            </Typography>
            <List>
                {patients.map((patient) => (
                    <ListItem key={patient.id} divider onClick={() => alert(`Opening case file for ${patient.name}`)} style={{ cursor: 'pointer' }}>
                        <Avatar src={patient.photo} alt={patient.name} sx={{ mr: 2 }} />
                        <ListItemText primary={patient.name} secondary={`${patient.appointment} - Priority: ${patient.priority}`} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

// YourDay: Displays the doctor's daily schedule with an option to add a new event.
const YourDay = () => {
    const schedule = [
        { time: '08:00 AM', event: 'Morning Briefing' },
        { time: '10:00 AM', event: 'Patient Consultation' },
        { time: '12:00 PM', event: 'Team Meeting' },
        { time: '02:00 PM', event: 'Follow-up Appointments' },
    ];
    return (
        <Box sx={boxStyle}>
            <Box display='flex' alignItems='center' mb={1}>
                <AccessTimeIcon color='action' />
                <Typography variant='h6' ml={1}>
                    Your Day
                </Typography>
            </Box>
            <List>
                {schedule.map((item, index) => (
                    <ListItem key={index} divider>
                        <ListItemText primary={item.event} secondary={item.time} />
                    </ListItem>
                ))}
            </List>
            <Button variant='contained' color='primary' sx={{ mt: 1 }} onClick={() => alert('Add new schedule item')}>
                + Add Schedule
            </Button>
        </Box>
    );
};

// ConsultationActions: Contains buttons to start consultation and to request nurse assistance.
const ConsultationActions = () => {
    const [nurseOptionsVisible, setNurseOptionsVisible] = useState(false);
    return (
        <Box sx={boxStyle}>
            <Box display='flex' justifyContent='space-around'>
                <Button variant='contained' color='success' onClick={() => alert('Consultation started!')}>
                    Start Consultation
                </Button>
                <Button variant='contained' color='warning' onClick={() => setNurseOptionsVisible(!nurseOptionsVisible)}>
                    Request Nurse
                </Button>
            </Box>
            {nurseOptionsVisible && (
                <Box mt={2}>
                    <Typography variant='subtitle1'>Nurse Options:</Typography>
                    <Box display='flex' flexDirection='column' gap={1}>
                        <Button variant='outlined' onClick={() => alert('Nurse called to consult room')}>
                            Call Nurse to Consult Room
                        </Button>
                        <Button variant='outlined' onClick={() => alert('Chat with Nurse')}>
                            Chat Option
                        </Button>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

// DiagnosticNotifications: Displays notifications for completed diagnostics.
const DiagnosticNotifications = () => {
    const notifications = [
        { id: 1, message: 'Lab results for Patient X are ready.', link: '#' },
        { id: 2, message: 'Imaging report for Patient Y available for review.', link: '#' },
    ];
    return (
        <Box sx={boxStyle}>
            <Typography variant='h6' mb={1}>
                Diagnostic Completion Notifications
            </Typography>
            <List>
                {notifications.map((note) => (
                    <ListItem key={note.id} divider onClick={() => alert(`Viewing report: ${note.message}`)} style={{ cursor: 'pointer' }}>
                        <ListItemText primary={note.message} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

// SupportButtons: Provides buttons to access the software helpdesk and issue reporting.
const SupportButtons = () => {
    return (
        <Box display='flex' justifyContent='center' gap={2} mt={2}>
            <Button variant='outlined' startIcon={<HelpIcon />} onClick={() => alert('Contacting helpdesk...')}>
                Software Helpdesk
            </Button>
            <Button variant='outlined' startIcon={<BugReportIcon />} onClick={() => alert('Reporting an issue...')}>
                Report & Issue
            </Button>
        </Box>
    );
};

// Dashboard: Combines all components using Box for layout.
const Dashboard = () => {
    const theme = useTheme();
    return (
        <Box
            sx={{
                backgroundColor: theme.palette.background.default,
                minHeight: '80vh',
                p: 2,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-around',
            }}
        >
            <Box
                sx={{
                    maxHeight: 'fit-content',
                }}
            >
                <UpdateComponent />
                <Header />
            </Box>
            <Box display='flex' flexDirection={{ xs: 'column', md: 'row' }} gap={2} height='50rem'>
                <Box flex={1}>
                    <WeatherWidget />
                    <InstantMessaging />
                </Box>
                <Box flex={1}>
                    <Alerts />
                    <Appointments />
                </Box>
                <Box flex={1}>
                    <PatientList />
                    <ConsultationActions />
                    <DiagnosticNotifications />
                </Box>
            </Box>
            <Box>
                <SupportButtons />
            </Box>
        </Box>
    );
};

export default Dashboard;
