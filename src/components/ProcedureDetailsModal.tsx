// src/components/ProcedureDetailsModal.tsx

import { Box, Typography, Chip, TextField, useTheme, IconButton, CircularProgress, Modal, Button, Select, MenuItem } from '@mui/material';
import { invoke } from '@tauri-apps/api/core';
import React, { useEffect, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import CloseIcon from '@mui/icons-material/Close';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Procedure } from './PatientProcedureGrid';

dayjs.extend(utc);

const ProcedureDetailsModal: React.FC<{
    procedure: Procedure | null;
    patient_id: number;
    onClose: () => void;
}> = ({ procedure, patient_id, onClose }) => {
    const theme = useTheme();
    const toast = useToast();

    const [status, setStatus] = useState('TO_BE_REVIEWED');
    const [doctorNote, setDoctorNote] = useState('');
    const [patientComplaint, setPatientComplaint] = useState('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [activityTime, setActivityTime] = useState(dayjs());

    if (!procedure) return null;

    const createProcedure = async () => {
        try {
            setIsLoading(true);
            if (!activityTime) {
                throw Error('No activity time specified.');
            }
            const formattedTime = activityTime.utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
            await invoke('create_patient_activity', {
                patientId: patient_id,
                procedureId: procedure.procedure_id,
                status: status || 'TO_BE_REVIEWED',
                doctorsNote: doctorNote || '',
                patientComplaint: patientComplaint || '',
                activityTime: formattedTime,
            });
            toast({
                title: 'Successfully created procedure',
                status: 'success',
                duration: 4000,
                isClosable: true,
                position: 'top',
            });
            onClose();
            setDoctorNote('');
            setActivityTime(dayjs());
            setPatientComplaint('');
        } catch (error) {
            console.error('Error while creating procedure: ', error);
            toast({
                title: `Error while creating procedure: ${error}`,
                status: 'error',
                duration: 4000,
                isClosable: true,
                position: 'top',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal open={!!procedure} onClose={onClose} disableEscapeKeyDown={false}>
            <Box
                sx={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: theme.palette.background.paper,
                    padding: 4,
                    borderRadius: '8px',
                    boxShadow: theme.shadows[5],
                    width: '50%',
                    maxWidth: '600px',
                    zIndex: 3,
                }}
            >
                <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <CloseIcon />
                </IconButton>
                <Typography variant='h6' fontWeight='bold' mb={2}>
                    {procedure.procedure_name}
                </Typography>
                <Typography variant='body1' mb={2}>
                    {procedure.description}
                </Typography>
                <Select
                    value={status === 'TO_BE_REVIEWED' ? 'PENDING' : status}
                    onChange={(e) => setStatus(e.target.value)}
                    fullWidth
                    sx={{ mb: 2 }}
                    renderValue={(selected) => <Chip label={selected} />}
                    label='Status'
                >
                    <MenuItem value='TO_BE_REVIEWED'>
                        <Chip
                            label={'PENDING'}
                            sx={{
                                backgroundColor: theme.palette.paperYellow.light,
                                color: theme.palette.common.black,
                                fontWeight: 'bold',
                            }}
                        />
                    </MenuItem>
                    <MenuItem value='COMPLETED'>
                        <Chip
                            label={'COMPLETED'}
                            sx={{
                                backgroundColor: theme.palette.paperGreen.default,
                                color: theme.palette.common.black,
                                fontWeight: 'bold',
                            }}
                        />
                    </MenuItem>
                    <MenuItem value='INCOMPLETE'>
                        <Chip
                            label={'INCOMPLETE'}
                            sx={{
                                backgroundColor: theme.palette.paperRed.default,
                                color: theme.palette.common.white,
                                fontWeight: 'bold',
                            }}
                        />
                    </MenuItem>
                </Select>
                <Box
                    sx={{
                        display: 'flex',
                        width: '100%',
                        mb: 2,
                    }}
                >
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker
                            label='Activity Time'
                            value={activityTime}
                            onChange={(newValue: any) => setActivityTime(newValue)}
                            slotProps={{ textField: { fullWidth: true } }}
                        />
                    </LocalizationProvider>
                </Box>
                <TextField
                    label="Doctor's Note"
                    multiline
                    rows={3}
                    fullWidth
                    value={doctorNote}
                    onChange={(e) => setDoctorNote(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <TextField
                    label='Patient Complaint'
                    multiline
                    rows={3}
                    fullWidth
                    value={patientComplaint}
                    onChange={(e) => setPatientComplaint(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <Button
                    variant='contained'
                    onClick={async () => await createProcedure()}
                    disabled={isLoading}
                    sx={{ alignSelf: 'flex-start', marginTop: '8px', backgroundColor: theme.palette.common.black, color: theme.palette.common.white }}
                >
                    {isLoading ? <CircularProgress size={20} /> : 'Submit'}
                </Button>
            </Box>
        </Modal>
    );
};

export default ProcedureDetailsModal;
