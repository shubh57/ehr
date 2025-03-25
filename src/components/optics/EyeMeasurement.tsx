import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, TextField, Chip, IconButton, Paper, CircularProgress } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { useTheme } from '@mui/material';
import { useToast } from '@chakra-ui/react';
import { invoke } from '@tauri-apps/api/core';
import { useQuery, useQueryClient } from 'react-query';

export type EyeMeasurementData = {
    measurement_id: number;
    patient_id: number;
    iop_at: string;
    iop_nct: string;
    cct: string;
    tond: string;
    side: string;
    created_at: string;
    created_by: string;
    updated_at: string;
    updated_by: string;
};

const measurements = [
    { label: 'IOP_AT', field: 'iop_at' },
    { label: 'IOP_NCT', field: 'iop_nct' },
    { label: 'CCT', field: 'cct' },
    { label: 'TOND', field: 'tond' },
];

const fetchEyeMeasurementData = async (patientId: number, side: string): Promise<EyeMeasurementData> => {
    return await invoke<EyeMeasurementData>('get_patient_eye_measurement_data', {
        patientId,
        side,
    });
};

const EyeMeasurement: React.FC<{ patient_id: number }> = ({ patient_id }) => {
    const theme = useTheme();
    const toast = useToast();
    const queryClient = useQueryClient();

    const [leftEyeMeasurement, setLeftEyeMeasurement] = useState<EyeMeasurementData | null>(null);
    const [rightEyeMeasurement, setRightEyeMeasurement] = useState<EyeMeasurementData | null>(null);
    const [updateLoading, setUpdateLoading] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);

    const leftQuery = useQuery<EyeMeasurementData, Error>(['eye_measurement', patient_id, 'LEFT'], () => fetchEyeMeasurementData(patient_id, 'LEFT'));
    const rightQuery = useQuery<EyeMeasurementData, Error>(['eye_measurement', patient_id, 'RIGHT'], () => fetchEyeMeasurementData(patient_id, 'RIGHT'));

    const isLoading = leftQuery.isLoading || rightQuery.isLoading;

    const handleEyeMeasurementUpdate = async () => {
        try {
            setUpdateLoading(true);
            await invoke('update_patient_eye_measurement_data', {
                patientId: patient_id,
                iopAt: leftEyeMeasurement?.iop_at,
                iopNct: leftEyeMeasurement?.iop_nct,
                cct: leftEyeMeasurement?.cct,
                tond: leftEyeMeasurement?.tond,
                side: 'LEFT',
                updatedBy: 1,
            });
            await invoke('update_patient_eye_measurement_data', {
                patientId: patient_id,
                iopAt: rightEyeMeasurement?.iop_at,
                iopNct: rightEyeMeasurement?.iop_nct,
                cct: rightEyeMeasurement?.cct,
                tond: rightEyeMeasurement?.tond,
                side: 'RIGHT',
                updatedBy: 1,
            });

            queryClient.invalidateQueries(['eye_measurement', patient_id, 'LEFT']);
            queryClient.invalidateQueries(['eye_measurement', patient_id, 'RIGHT']);
        } catch (error) {
            console.error('Error while updating eye measurement data: ', error);
            toast({
                title: `Error while updating eye measurement data: ${error}`,
                status: 'error',
                duration: 4000,
                isClosable: true,
                position: 'top',
            });
        } finally {
            setUpdateLoading(false);
        }
    };

    useEffect(() => {
        if (leftQuery.data) {
            setLeftEyeMeasurement(leftQuery.data);
        }
    }, [leftQuery.data]);

    useEffect(() => {
        if (rightQuery.data) {
            setRightEyeMeasurement(rightQuery.data);
        }
    }, [rightQuery.data]);

    const handleLeftChange = (field: keyof EyeMeasurementData) => (event: React.ChangeEvent<HTMLInputElement>) => {
        if (leftEyeMeasurement) {
            setLeftEyeMeasurement({ ...leftEyeMeasurement, [field]: event.target.value });
        } else {
            const data: EyeMeasurementData = {
                measurement_id: 21,
                patient_id: patient_id,
                iop_at: '',
                iop_nct: '',
                cct: '',
                tond: '',
                side: 'LEFT',
                created_at: '',
                created_by: '',
                updated_at: '',
                updated_by: '',
                [field]: event.target.value,
            };
            setLeftEyeMeasurement(data);
        }
    };

    const handleRightChange = (field: keyof EyeMeasurementData) => (event: React.ChangeEvent<HTMLInputElement>) => {
        if (rightEyeMeasurement) {
            setRightEyeMeasurement({ ...rightEyeMeasurement, [field]: event.target.value });
        } else {
            const data: EyeMeasurementData = {
                measurement_id: 21,
                patient_id: patient_id,
                iop_at: '',
                iop_nct: '',
                cct: '',
                tond: '',
                side: 'RIGHT',
                created_at: '',
                created_by: '',
                updated_at: '',
                updated_by: '',
                [field]: event.target.value,
            };
            setRightEyeMeasurement(data);
        }
    };

    const toggleEditMode = async () => {
        if (editMode) {
            await handleEyeMeasurementUpdate();
        }
        setEditMode((prev) => !prev);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                padding: '0.2rem',
                borderRadius: '28px',
                border: '0.5px solid black',
            }}
        >
            {/* Toggle button for edit mode */}
            <Paper elevation={3} style={{ padding: theme.spacing(2), width: '100%', height: '100%', borderRadius: '28px' }}>
                <Box display='flex' justifyContent='flex-end' mb={2}>
                    <IconButton onClick={toggleEditMode} disabled={updateLoading}>
                        {updateLoading ? <CircularProgress size={20} /> : editMode ? <LockOpenIcon /> : <LockIcon />}
                    </IconButton>
                </Box>
                {measurements.map((measurement) => (
                    <Grid container spacing={2} alignItems='center' key={measurement.field} style={{ marginBottom: theme.spacing(1) }}>
                        {/* Right measurement */}
                        <Grid item xs={4}>
                            <Box display='flex' justifyContent='flex-start'>
                                {editMode ? (
                                    <TextField
                                        variant='outlined'
                                        size='small'
                                        value={rightEyeMeasurement ? rightEyeMeasurement[measurement.field as keyof EyeMeasurementData] : ''}
                                        onChange={handleRightChange(measurement.field as keyof EyeMeasurementData)}
                                    />
                                ) : (
                                    <Chip
                                        label={rightEyeMeasurement ? rightEyeMeasurement[measurement.field as keyof EyeMeasurementData] : '--'}
                                        color='primary'
                                    />
                                )}
                            </Box>
                        </Grid>
                        {/* Measurement name */}
                        <Grid item xs={4}>
                            <Typography align='center'>{measurement.label}</Typography>
                        </Grid>
                        {/* Left measurement */}
                        <Grid item xs={4}>
                            <Box display='flex' justifyContent='flex-end'>
                                {editMode ? (
                                    <TextField
                                        variant='outlined'
                                        size='small'
                                        value={leftEyeMeasurement ? leftEyeMeasurement[measurement.field as keyof EyeMeasurementData] : ''}
                                        onChange={handleLeftChange(measurement.field as keyof EyeMeasurementData)}
                                    />
                                ) : (
                                    <Chip
                                        label={leftEyeMeasurement ? leftEyeMeasurement[measurement.field as keyof EyeMeasurementData] : '--'}
                                        color='primary'
                                    />
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                ))}
            </Paper>
        </Box>
    );
};

export default EyeMeasurement;
