// Dependencies
import { useToast } from '@chakra-ui/react';
import { Box, CircularProgress, Paper, Typography, IconButton, TextField, useTheme, CardContent, Card, Select, MenuItem } from '@mui/material';
import { invoke } from '@tauri-apps/api/core';
import React, { useEffect, useState } from 'react';
import { Lock, LockOpen } from '@mui/icons-material';

export type VisionData = {
    vision_id: number;
    patient_id: number;
    near_vision: String;
    distant_vision: String;
    side: String;
    value_type: String;
    created_at: String;
    created_by: number;
    updated_at: String;
    updated_by: number;
};

const visionOptions = [
    '6/6',
    '6/6 - P',
    '6/9',
    '6/9 - P',
    '6/12',
    '6/12 - P',
    '6/18',
    '6/18 - P',
    '6/24',
    '6/24 - P',
    '6/36',
    '6/36 - P',
    '6/60',
    '6/60 - P',
    'CF@5m',
    'CF@4m',
    'CF@3m',
    'CF@2m',
    'CF@1m',
    'CF@0.5m',
    'CF CF',
    'HM+',
    'PL+ PR-',
    'PL- PR+',
    'No PL',
];

const PatientVision: React.FC<{
    patient_id: number;
    side: String;
    value_type: String;
}> = ({ patient_id, side, value_type }) => {
    const toast = useToast();
    const theme = useTheme();

    const [visionData, setVisionData] = useState<VisionData>();
    const [nearVision, setNearVision] = useState<String>('');
    const [distantVision, setDistantVision] = useState<String>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLocked, setIsLocked] = useState<boolean>(true);
    const [updateLoading, setUpdateLoading] = useState<boolean>(false);

    const fetchVisionData = async () => {
        try {
            setIsLoading(true);
            const data: VisionData = await invoke('get_vision_data', { query: { patient_id: patient_id, side: side, value_type: value_type } });
            setNearVision(data.near_vision);
            setDistantVision(data.distant_vision);
            setVisionData(data);
        } catch (error) {
            console.error('Error while fetching vision data: ', error);
            toast({
                title: `Error while fetching vision data: ${error}`,
                status: 'error',
                duration: 4000,
                isClosable: true,
                position: 'top',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVisionUpdate = async () => {
        try {
            setUpdateLoading(true);
            await invoke('update_vision_data', {
                patientId: patient_id,
                nearVision: nearVision,
                distantVision: distantVision,
                side: side,
                valueType: value_type,
                updatedBy: 1,
            });
        } catch (error) {
            console.error('Error while updating vision data: ', error);
            toast({
                title: `Error while updating vision data: ${error}`,
                status: 'error',
                duration: 4000,
                isClosable: true,
                position: 'top',
            });
        } finally {
            setUpdateLoading(false);
        }
    };

    const toggleLock = async () => {
        if (!isLocked) {
            await handleVisionUpdate();
        }
        setIsLocked(!isLocked);
    };

    useEffect(() => {
        fetchVisionData();
    }, []);

    return (
        <Box display='flex' alignItems='center' justifyContent='center' height='100%' width='9rem'>
            {isLoading ? (
                <CircularProgress size={24} />
            ) : (
                <Card
                    sx={{
                        py: 1.5,
                        px: 2,
                        borderRadius: '28px',
                        bgcolor: 'background.paper',
                        boxShadow: 3,
                        marginTop: '2rem',
                        border: '0.5px solid black',
                        minHeight: '13rem',
                        maxHeight: '13rem',
                    }}
                >
                    <CardContent sx={{ p: 2 }}>
                        <Box display='flex' flexDirection='column' gap={1.5}>
                            {/* Header */}
                            <Box display='flex' alignItems='center' justifyContent='space-between' textAlign='center'>
                                <Typography variant='h6' fontWeight='bold'>
                                    {value_type}
                                </Typography>
                                <IconButton onClick={toggleLock} size='small' sx={{ p: 0.5 }}>
                                    {isLocked ? <Lock /> : <LockOpen />}
                                </IconButton>
                            </Box>

                            {/* Divider */}
                            <Box
                                sx={{
                                    height: '1px',
                                    width: '100%',
                                    bgcolor: 'divider',
                                }}
                            />

                            {/* Near Vision */}
                            <Box>
                                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>
                                    NV
                                </Typography>
                                {isLocked ? (
                                    <Typography variant='body1' fontWeight='medium' textAlign='center'>
                                        {nearVision}
                                    </Typography>
                                ) : (
                                    <Select
                                        value={nearVision}
                                        onChange={(e) => setNearVision(e.target.value)}
                                        fullWidth
                                        displayEmpty
                                        sx={{ bgcolor: 'action.hover', borderRadius: 1, maxHeight: '1.5rem' }}
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 200,
                                                    overflow: 'auto',
                                                },
                                            },
                                        }}
                                    >
                                        {visionOptions.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                )}
                            </Box>

                            {/* Distant Vision */}
                            <Box>
                                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>
                                    DV
                                </Typography>
                                {isLocked ? (
                                    <Typography variant='body1' fontWeight='medium' textAlign='center'>
                                        {distantVision}
                                    </Typography>
                                ) : (
                                    <Select
                                        value={distantVision}
                                        onChange={(e) => setDistantVision(e.target.value)}
                                        fullWidth
                                        displayEmpty
                                        sx={{ bgcolor: 'action.hover', borderRadius: 1, maxHeight: '1.5rem' }}
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 200,
                                                    overflow: 'auto',
                                                },
                                            },
                                        }}
                                    >
                                        {visionOptions.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                )}
                            </Box>

                            {/* Last Updated */}
                            {visionData && (
                                <Typography
                                    variant='caption'
                                    color='text.secondary'
                                    sx={{
                                        fontSize: '10px',
                                        textAlign: 'center',
                                        display: 'block',
                                    }}
                                >
                                    Last updated:{' '}
                                    {visionData.updated_at
                                        ? new Date(visionData.updated_at.toString()).toLocaleString('en-GB', {
                                              day: '2-digit',
                                              month: '2-digit',
                                              year: '2-digit',
                                              hour: '2-digit',
                                              minute: '2-digit',
                                          })
                                        : visionData.created_at
                                          ? new Date(visionData.created_at.toString()).toLocaleString('en-GB', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })
                                          : 'N/A'}
                                </Typography>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default PatientVision;
