// src/components/doctor-dashboard/Alerts.tsx

import React, { useEffect, useState } from 'react';
import {
    Box,
    useTheme,
    Typography,
    IconButton,
    Modal,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    Card,
    CardContent,
    Chip,
    Button,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { invoke } from '@tauri-apps/api/core';
import { UserInterface } from '../../redux/auth/interfaces';
import { useToast } from '@chakra-ui/react';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import CustomToggleButton from '../../common-components/ToggleButton';
import { useQuery, useQueryClient } from 'react-query';

export type Alert = {
    alert_id: number;
    priority_level: string;
    title: string;
    message: string;
    issued_for: number;
    issued_for_name: string;
    issued_by: number;
    issued_by_name: string;
};

const fetchAlerts = async (token: string): Promise<Alert[]> => {
    return await invoke<Alert[]>('get_alerts', { token });
};

const fetchDoctors = async (token: string): Promise<UserInterface[]> => {
    return await invoke<UserInterface[]>('get_all_doctors', { token });
};

const Alerts: React.FC = () => {
    const { user, token } = useSelector((state: RootState) => state.auth);
    const toast = useToast();
    const theme = useTheme();
    const queryClient = useQueryClient();

    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [sentAlerts, setSentAlerts] = useState<Alert[]>([]);
    const [alertSending, setAlertSending] = useState<boolean>(false);
    const [priorityLevel, setPriorityLevel] = useState<'EMERGENCY' | 'NORMAL'>('NORMAL');
    const [title, setTitle] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [issuedFor, setIssuedFor] = useState<number>();
    const [doctors, setDoctors] = useState<UserInterface[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<'received' | 'sent'>('received');

    const alertsQuery = useQuery<Alert[], Error>(['alerts', user?.user_id], () => fetchAlerts(token || ""));
    const alertsLoading = alertsQuery.isLoading;

    const doctorsQuery = useQuery<UserInterface[], Error>(['all_doctors'], () => fetchDoctors(token || ""));
    const doctorLoading = doctorsQuery.isLoading;

    useEffect(() => {
        if (alertsQuery.data) {
            setAlerts(alertsQuery.data);
        }
    }, [alertsQuery.data]);

    useEffect(() => {
        if (doctorsQuery.data) {
            setDoctors(doctorsQuery.data.filter(doctor => doctor.user_id != user?.user_id));
        }
    }, [doctorsQuery.data]);

    const sendAlert = async () => {
        try {
            if (!issuedFor) {
                toast({
                    title: 'Please select a doctor',
                    status: 'error',
                    duration: 4000,
                    isClosable: true,
                    position: 'top',
                });
                return;
            }

            if (!title.trim()) {
                toast({
                    title: 'Title is required',
                    status: 'error',
                    duration: 4000,
                    isClosable: true,
                    position: 'top',
                });
                return;
            }

            if (!message.trim()) {
                toast({
                    title: 'Message is required',
                    status: 'error',
                    duration: 4000,
                    isClosable: true,
                    position: 'top',
                });
                return;
            }

            setAlertSending(true);
            const data: Alert = await invoke('create_alert', { token, priorityLevel, title, message, issuedFor });

            // Reset form fields
            setPriorityLevel('NORMAL');
            setTitle('');
            setMessage('');
            setIssuedFor(undefined);

            // Close modal
            setIsModalOpen(false);

            // Refresh alerts
            queryClient.invalidateQueries(['alerts', user?.user_id]);

            toast({
                title: `Alert sent successfully`,
                status: 'success',
                duration: 4000,
                isClosable: true,
                position: 'top',
            });
        } catch (error) {
            console.error('Error while sending alert: ', error);
            toast({
                title: `Error while sending alert: ${error}`,
                status: 'error',
                duration: 4000,
                isClosable: true,
                position: 'top',
            });
        } finally {
            setAlertSending(false);
        }
    };

    const renderAlertCard = (alert: Alert, isReceived: boolean) => {
        return (
            <Card
                key={alert.alert_id}
                sx={{
                    borderLeft: alert.priority_level === 'EMERGENCY' ? `4px solid ${theme.palette.error.main}` : `4px solid ${theme.palette.primary.main}`,
                }}
            >
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant='h6' sx={{ fontWeight: 'medium' }}>
                            {alert.title}
                        </Typography>
                        <Chip
                            label={alert.priority_level}
                            size='small'
                            color={alert.priority_level === 'EMERGENCY' ? 'error' : 'primary'}
                            sx={{ fontWeight: alert.priority_level === 'EMERGENCY' ? 'bold' : 'normal' }}
                        />
                    </Box>
                    <Typography variant='body2'>{alert.message}</Typography>
                    <Typography variant='caption' color='text.secondary'>
                        {isReceived ? `From: Dr. ${alert.issued_by_name}` : `To: Dr. ${alert.issued_for_name}`}
                    </Typography>
                </Box>
            </Card>
        );
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', borderRadius: 2, overflow: 'scroll', boxShadow: 3, maxHeight: '30rem' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
                <Box
                    sx={{
                        display: 'flex',
                    }}
                >
                    <Typography variant='h6'>Alerts</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            width: '80%',
                        }}
                    >
                        <CustomToggleButton
                            selected={viewMode}
                            onChange={(_, newMode) => newMode && setViewMode(newMode as 'received' | 'sent')}
                            options={[
                                { label: 'Received', value: 'received' },
                                { label: 'Sent', value: 'sent' },
                            ]}
                        />
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            width: '20%',
                        }}
                    >
                        <IconButton
                            size='small'
                            color='primary'
                            onClick={() => setIsModalOpen(true)}
                            sx={{
                                ml: 2,
                                bgcolor: theme.palette.primary.main,
                                color: 'white',
                                '&:hover': { bgcolor: theme.palette.primary.dark },
                                width: 40,
                                height: 40,
                            }}
                        >
                            <AddIcon />
                        </IconButton>
                    </Box>
                </Box>
            </Box>
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                {alertsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                    </Box>
                ) : alerts.filter((alert) => (viewMode === 'received' ? alert.issued_for === user?.user_id : alert.issued_by === user?.user_id)).length ===
                  0 ? (
                    <Typography sx={{ p: 2, color: 'text.secondary', textAlign: 'center' }}>
                        No alerts {viewMode === 'received' ? 'received' : 'sent'}
                    </Typography>
                ) : (
                    alerts
                        .filter((alert) => (viewMode === 'received' ? alert.issued_for === user?.user_id : alert.issued_by === user?.user_id))
                        .map((alert) => renderAlertCard(alert, viewMode === 'received'))
                )}
            </Box>

            {/* Create Alert Modal */}
            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} aria-labelledby='create-alert-modal'>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 500,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        boxShadow: 24,
                        p: 4,
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant='h5' component='h2'>
                            Create New Alert
                        </Typography>
                        <IconButton onClick={() => setIsModalOpen(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel id='priority-select-label'>Priority Level</InputLabel>
                        <Select
                            labelId='priority-select-label'
                            value={priorityLevel}
                            label='Priority Level'
                            onChange={(e) => setPriorityLevel(e.target.value as 'EMERGENCY' | 'NORMAL')}
                        >
                            <MenuItem value='NORMAL'>Normal</MenuItem>
                            <MenuItem value='EMERGENCY'>Emergency</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField fullWidth label='Title' variant='outlined' value={title} onChange={(e) => setTitle(e.target.value)} sx={{ mb: 3 }} />

                    <TextField
                        fullWidth
                        label='Message'
                        variant='outlined'
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        multiline
                        rows={4}
                        sx={{ mb: 3 }}
                    />

                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel id='doctor-select-label'>Send To</InputLabel>
                        <Select
                            labelId='doctor-select-label'
                            value={issuedFor || ''}
                            label='Send To'
                            onChange={(e) => setIssuedFor(e.target.value as number)}
                            disabled={doctorLoading}
                        >
                            {doctors.map((doctor) => (
                                <MenuItem key={doctor.user_id} value={doctor.user_id}>
                                    Dr. {doctor.first_name} {doctor.last_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button variant='outlined' onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant='contained'
                            onClick={sendAlert}
                            disabled={alertSending}
                            startIcon={alertSending ? <CircularProgress size={20} /> : null}
                        >
                            {alertSending ? 'Sending...' : 'Send Alert'}
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
};

export default Alerts;
