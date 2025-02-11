// src/components/optics/PatientVision.tsx

// Dependencies
import { useToast } from '@chakra-ui/react';
import { Box, CircularProgress, Paper, Typography, IconButton, TextField, Grid, useTheme, CardContent, Card, Divider } from '@mui/material';
import { invoke } from '@tauri-apps/api/core';
import React, { useEffect, useState } from 'react';
import { Lock, LockOpen } from '@mui/icons-material';

export type RefractionData = {
    vision_id: number;
    patient_id: number;
    spherical: string;
    cylindrical: string;
    axis: string;
    side: string;
    value_type: string;
    created_at: string;
    created_by: number;
    updated_at: string;
    updated_by: number;
};

const PatientRefraction: React.FC<{
    patient_id: number;
    side: string;
}> = ({ patient_id, side }) => {
    const toast = useToast();
    const theme = useTheme();

    const [spherical, setSpherical] = useState<string>('');
    const [cylindrical, setCylindrical] = useState<string>('');
    const [axis, setAxis] = useState<string>('');
    const [sphericalDilated, setSphericalDilated] = useState<string>('N/A');
    const [cylindricalDilated, setCylindricalDilated] = useState<string>('N/A');
    const [axisDilated, setAxisDilated] = useState<string>('N/A');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLocked, setIsLocked] = useState<boolean>(true);
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [updateLoading, setUpdateLoading] = useState<boolean>(false);

    const fetchVisionData = async () => {
        try {
            setIsLoading(true);
            const data: RefractionData = await invoke('get_refraction_data', { query: { patient_id: patient_id, side: side, value_type: 'UD' } });
            setSpherical(data.spherical);
            setCylindrical(data.cylindrical);
            setAxis(data.axis);

            const dataDilated: RefractionData = await invoke('get_refraction_data', { query: { patient_id: patient_id, side: side, value_type: 'DL' } });
            setSphericalDilated(dataDilated?.spherical || 'N/A');
            setCylindricalDilated(dataDilated?.cylindrical || 'N/A');
            setAxisDilated(dataDilated?.axis || 'N/A');
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

    const handleRefractionUpdate = async () => {
        try {
            setUpdateLoading(true);
            await invoke('update_refraction_data', {
                patientId: patient_id,
                spherical: spherical,
                cylindrical: cylindrical,
                axis: axis,
                side: side,
                valueType: 'UD',
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
            await handleRefractionUpdate();
        }
        setIsLocked(!isLocked);
    };

    const handleDoubleClick = () => {
        setIsExpanded(!isExpanded);
    };

    const hasDilationValues = sphericalDilated !== 'N/A' || cylindricalDilated !== 'N/A' || axisDilated !== 'N/A';

    useEffect(() => {
        fetchVisionData();
    }, []);

    return (
        <Box display='flex' justifyContent='center' width='18rem'>
            {isLoading ? (
                <CircularProgress size={24} />
            ) : (
                <Card
                    onDoubleClick={handleDoubleClick}
                    sx={{
                        width: '100%',
                        py: 1.5,
                        px: 2,
                        borderRadius: '28px',
                        bgcolor: 'background.paper',
                        boxShadow: 3,
                        border: '0.5px solid black',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        position: 'relative',
                        marginTop: '2rem',
                    }}
                >
                    <CardContent sx={{ p: 2 }}>
                        <Box display='flex' flexDirection='column' gap={1.5}>
                            <Box display='flex' justifyContent='space-between' alignItems='center'>
                                <Typography variant='body2' fontWeight='bold' color='text.secondary'>
                                    Refraction Values
                                </Typography>
                            </Box>

                            {/* Values Container with Column Dividers */}
                            <Box sx={{ position: 'relative', minHeight: '80px' }}>
                                {/* Column Headers */}
                                <Box display='flex' justifyContent='space-around' mb={2}>
                                    <Typography variant='body2' fontWeight='bold' color='text.secondary' sx={{ flex: 1, textAlign: 'center' }}>
                                        SPH
                                    </Typography>
                                    <Typography variant='body2' fontWeight='bold' color='text.secondary' sx={{ flex: 1, textAlign: 'center' }}>
                                        CYL
                                    </Typography>
                                    <Typography variant='body2' fontWeight='bold' color='text.secondary' sx={{ flex: 1, textAlign: 'center' }}>
                                        AXIS
                                    </Typography>
                                </Box>

                                {/* Regular Values */}
                                <Box display='flex' justifyContent='space-around' mb={isExpanded ? 2 : 0}>
                                    <Typography variant='body1' fontWeight='medium' sx={{ flex: 1, textAlign: 'center' }}>
                                        {spherical}
                                    </Typography>
                                    <Typography variant='body1' fontWeight='medium' sx={{ flex: 1, textAlign: 'center' }}>
                                        {cylindrical}
                                    </Typography>
                                    <Typography variant='body1' fontWeight='medium' sx={{ flex: 1, textAlign: 'center' }}>
                                        {axis}
                                    </Typography>
                                </Box>

                                {/* Dilation Values Section */}
                                {isExpanded && (
                                    <>
                                        <Box mt={2}>
                                            <Typography variant='body2' fontWeight='bold' color='text.secondary' sx={{ mb: 1 }}>
                                                {hasDilationValues ? 'Values After Dilation' : 'No Dilation Values Available'}
                                            </Typography>
                                            <Box display='flex' justifyContent='space-around'>
                                                <Typography variant='body1' fontWeight='medium' sx={{ flex: 1, textAlign: 'center' }}>
                                                    {sphericalDilated}
                                                </Typography>
                                                <Typography variant='body1' fontWeight='medium' sx={{ flex: 1, textAlign: 'center' }}>
                                                    {cylindricalDilated}
                                                </Typography>
                                                <Typography variant='body1' fontWeight='medium' sx={{ flex: 1, textAlign: 'center' }}>
                                                    {axisDilated}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </>
                                )}

                                {/* Vertical Dividers */}
                                <Divider
                                    orientation='vertical'
                                    sx={{
                                        position: 'absolute',
                                        left: '33.33%',
                                        height: '98%',
                                        top: 0,
                                    }}
                                />
                                <Divider
                                    orientation='vertical'
                                    sx={{
                                        position: 'absolute',
                                        left: '66.66%',
                                        height: '98%',
                                        top: 0,
                                    }}
                                />
                            </Box>

                            {/* Helper Text */}
                            <Typography
                                variant='caption'
                                color='text.secondary'
                                sx={{
                                    fontSize: '10px',
                                    textAlign: 'center',
                                    display: 'block',
                                }}
                            >
                                Double click to {isExpanded ? 'hide' : 'show'} dilation values
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default PatientRefraction;
