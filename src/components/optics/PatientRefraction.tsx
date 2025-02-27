// src/components/optics/PatientRefraction.tsx

// Dependencies
import { useToast } from '@chakra-ui/react';
import { Box, CircularProgress, Typography, IconButton, Divider, CardContent, Card, Select, MenuItem } from '@mui/material';
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
    vision_type: string;
    created_at: string;
    created_by: number;
    updated_at: string;
    updated_by: number;
};

// Generate options for dropdowns
const generateSphericalCylindricalOptions = () => {
    const options = [];
    for (let i = 4; i >= -4; i -= 0.25) {
        options.push(i > 0 ? `+${i.toFixed(2)}` : i.toFixed(2));
    }
    return options;
};

const generateAxisOptions = () => {
    const options = [];
    for (let i = 0; i <= 180; i += 5) {
        options.push(`${i}°`);
    }
    return options;
};

const sphericalCylindricalOptions = generateSphericalCylindricalOptions();
const axisOptions = generateAxisOptions();

const PatientRefraction: React.FC<{
    patient_id: number;
    side: string;
}> = ({ patient_id, side }) => {
    const toast = useToast();

    // Distance Vision (DV) values
    const [sphericalDV, setSphericalDV] = useState<string>('');
    const [cylindricalDV, setCylindricalDV] = useState<string>('');
    const [axisDV, setAxisDV] = useState<string>('');

    // Near Vision (NV) values
    const [sphericalNV, setSphericalNV] = useState<string>('');
    const [cylindricalNV, setCylindricalNV] = useState<string>('');
    const [axisNV, setAxisNV] = useState<string>('');

    // Distance Vision (DV) values (Dilated)
    const [dilatedSphericalDV, setDilatedSphericalDV] = useState<string>('');
    const [dilatedCylindricalDV, setDilatedCylindricalDV] = useState<string>('');
    const [dilatedAxisDV, setDilatedAxisDV] = useState<string>('');

    // Near Vision (NV) values (Dilated)
    const [dilatedSphericalNV, setDilatedSphericalNV] = useState<string>('');
    const [dilatedCylindricalNV, setDilatedCylindricalNV] = useState<string>('');
    const [dilatedAxisNV, setDilatedAxisNV] = useState<string>('');

    const [refractionData, setRefractionData] = useState<RefractionData>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLocked, setIsLocked] = useState<boolean>(true);
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [updateLoading, setUpdateLoading] = useState<boolean>(false);

    const fetchRefractionData = async () => {
        try {
            setIsLoading(true);

            // Fetch Distance Vision data
            const dataDV: RefractionData = await invoke('get_refraction_data', {
                query: {
                    patient_id: patient_id,
                    side: side,
                    value_type: 'UD',
                    vision_type: 'DV',
                },
            });

            setSphericalDV(dataDV?.spherical || 'N/A');
            setCylindricalDV(dataDV?.cylindrical || 'N/A');
            setAxisDV(dataDV?.axis || 'N/A');
            setRefractionData(dataDV);

            // Fetch Near Vision data
            const dataNV: RefractionData = await invoke('get_refraction_data', {
                query: {
                    patient_id: patient_id,
                    side: side,
                    value_type: 'UD',
                    vision_type: 'NV',
                },
            });

            setSphericalNV(dataNV?.spherical || 'N/A');
            setCylindricalNV(dataNV?.cylindrical || 'N/A');
            setAxisNV(dataNV?.axis || 'N/A');

            // Fetch Distance Vision data (Dilated)
            const dilatedDataDV: RefractionData = await invoke('get_refraction_data', {
                query: {
                    patient_id: patient_id,
                    side: side,
                    value_type: 'DL',
                    vision_type: 'DV',
                },
            });

            setDilatedSphericalDV(dilatedDataDV?.spherical || 'N/A');
            setDilatedCylindricalDV(dilatedDataDV?.cylindrical || 'N/A');
            setDilatedAxisDV(dilatedDataDV?.axis || 'N/A');

            // Fetch Near Vision data (Dilated)
            const dilatedDataNV: RefractionData = await invoke('get_refraction_data', {
                query: {
                    patient_id: patient_id,
                    side: side,
                    value_type: 'DL',
                    vision_type: 'NV',
                },
            });

            setDilatedSphericalNV(dilatedDataNV?.spherical || 'N/A');
            setDilatedCylindricalNV(dilatedDataNV?.cylindrical || 'N/A');
            setDilatedAxisNV(dilatedDataNV?.axis || 'N/A');
        } catch (error) {
            console.error('Error while fetching refraction data: ', error);
            toast({
                title: `Error while fetching refraction data: ${error}`,
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

            // Update Distance Vision data
            await invoke('update_refraction_data', {
                patientId: patient_id,
                spherical: sphericalDV,
                cylindrical: cylindricalDV,
                axis: axisDV,
                side: side,
                valueType: 'UD',
                visionType: 'DV',
                updatedBy: 1,
            });

            // Update Near Vision data
            await invoke('update_refraction_data', {
                patientId: patient_id,
                spherical: sphericalNV,
                cylindrical: cylindricalNV,
                axis: axisNV,
                side: side,
                valueType: 'UD',
                visionType: 'NV',
                updatedBy: 1,
            });

            // Update Distance Vision data
            await invoke('update_refraction_data', {
                patientId: patient_id,
                spherical: dilatedSphericalDV,
                cylindrical: dilatedCylindricalDV,
                axis: dilatedAxisDV,
                side: side,
                valueType: 'DL',
                visionType: 'DV',
                updatedBy: 1,
            });

            // Update Near Vision data
            await invoke('update_refraction_data', {
                patientId: patient_id,
                spherical: dilatedSphericalNV,
                cylindrical: dilatedCylindricalNV,
                axis: dilatedAxisNV,
                side: side,
                valueType: 'DL',
                visionType: 'NV',
                updatedBy: 1,
            });

            // Refetch data to ensure UI is in sync
            fetchRefractionData();
        } catch (error) {
            console.error('Error while updating refraction data: ', error);
            toast({
                title: `Error while updating refraction data: ${error}`,
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

    useEffect(() => {
        fetchRefractionData();
    }, []);

    const renderValueOrDropdown = (value: string, setValue: (value: string) => void, options: string[]) => {
        if (isLocked) {
            return (
                <Typography variant='body1' fontWeight='medium' sx={{ flex: 1, textAlign: 'center' }}>
                    {value}
                </Typography>
            );
        } else {
            return (
                <Select
                    value={value === 'N/A' ? '' : value}
                    onChange={(e) => setValue(e.target.value)}
                    displayEmpty
                    size='small'
                    sx={{
                        flex: 1,
                        textAlign: 'center',
                        '.MuiSelect-select': {
                            padding: '4px 8px',
                            textAlign: 'center',
                        },
                        bgcolor: 'action.hover',
                        borderRadius: 1,
                        minWidth: '60px',
                    }}
                    MenuProps={{
                        PaperProps: {
                            style: {
                                maxHeight: 200,
                                overflow: 'auto',
                            },
                        },
                    }}
                >
                    <MenuItem value=''>N/A</MenuItem>
                    {options.map((option) => (
                        <MenuItem key={option} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </Select>
            );
        }
    };

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
                        <Box display='flex' flexDirection='column' gap={1}>
                            {/* Header with Lock/Unlock Button */}
                            <Box display='flex' justifyContent='space-between' alignItems='center'>
                                <Typography variant='body2' fontWeight='bold' color='text.secondary'>
                                    Refraction Values
                                </Typography>
                                <IconButton onClick={toggleLock} size='small' sx={{ p: 0.5 }} disabled={updateLoading}>
                                    {isLocked ? <Lock /> : <LockOpen />}
                                </IconButton>
                            </Box>

                            {/* Column Headers */}
                            <Box display='flex' justifyContent='space-around'>
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

                            {/* Distance Vision (DV) Values */}
                            <Box sx={{ position: 'relative' }}>
                                <Typography variant='body2' fontWeight='bold' color='text.secondary'>
                                    DV
                                </Typography>

                                <Box display='flex' justifyContent='space-around' alignItems='center'>
                                    {renderValueOrDropdown(sphericalDV, setSphericalDV, sphericalCylindricalOptions)}
                                    {renderValueOrDropdown(cylindricalDV, setCylindricalDV, sphericalCylindricalOptions)}
                                    {renderValueOrDropdown(axisDV, setAxisDV, axisOptions)}
                                </Box>

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

                            {/* Horizontal Divider between DV and NV */}
                            <Divider sx={{ width: '100%', my: 1 }} />

                            {/* Near Vision (NV) Values */}
                            <Box sx={{ position: 'relative' }}>
                                <Typography variant='body2' fontWeight='bold' color='text.secondary'>
                                    NV
                                </Typography>

                                <Box display='flex' justifyContent='space-around' alignItems='center'>
                                    {renderValueOrDropdown(sphericalNV, setSphericalNV, sphericalCylindricalOptions)}
                                    {renderValueOrDropdown(cylindricalNV, setCylindricalNV, sphericalCylindricalOptions)}
                                    {renderValueOrDropdown(axisNV, setAxisNV, axisOptions)}
                                </Box>

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

                            {/* Last Updated Info */}
                            {refractionData && (
                                <Typography
                                    variant='caption'
                                    color='text.secondary'
                                    sx={{
                                        fontSize: '10px',
                                        textAlign: 'center',
                                        display: 'block',
                                        marginTop: '1rem',
                                    }}
                                >
                                    Last updated:{' '}
                                    {refractionData.updated_at
                                        ? new Date(refractionData.updated_at.toString()).toLocaleString('en-GB', {
                                              day: '2-digit',
                                              month: '2-digit',
                                              year: '2-digit',
                                              hour: '2-digit',
                                              minute: '2-digit',
                                          })
                                        : refractionData.created_at
                                          ? new Date(refractionData.created_at.toString()).toLocaleString('en-GB', {
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
                        {isExpanded && (
                            <Box display='flex' flexDirection='column' gap={1} mt={2}>
                                {/* Header with Lock/Unlock Button */}
                                <Box display='flex' justifyContent='space-between' alignItems='center'>
                                    <Typography variant='body2' fontWeight='bold' color='text.secondary'>
                                        Refraction Values (After Dilation)
                                    </Typography>
                                </Box>

                                {/* Column Headers */}
                                <Box display='flex' justifyContent='space-around'>
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

                                {/* Distance Vision (DV) Values */}
                                <Box sx={{ position: 'relative' }}>
                                    <Typography variant='body2' fontWeight='bold' color='text.secondary'>
                                        DV
                                    </Typography>

                                    <Box display='flex' justifyContent='space-around' alignItems='center'>
                                        {renderValueOrDropdown(dilatedSphericalDV, setDilatedSphericalDV, sphericalCylindricalOptions)}
                                        {renderValueOrDropdown(dilatedCylindricalDV, setDilatedCylindricalDV, sphericalCylindricalOptions)}
                                        {renderValueOrDropdown(dilatedAxisDV, setDilatedAxisDV, axisOptions)}
                                    </Box>

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

                                {/* Horizontal Divider between DV and NV */}
                                <Divider sx={{ width: '100%', my: 1 }} />

                                {/* Near Vision (NV) Values */}
                                <Box sx={{ position: 'relative' }}>
                                    <Typography variant='body2' fontWeight='bold' color='text.secondary'>
                                        NV
                                    </Typography>

                                    <Box display='flex' justifyContent='space-around' alignItems='center'>
                                        {renderValueOrDropdown(dilatedSphericalNV, setDilatedSphericalNV, sphericalCylindricalOptions)}
                                        {renderValueOrDropdown(dilatedCylindricalNV, setDilatedCylindricalNV, sphericalCylindricalOptions)}
                                        {renderValueOrDropdown(dilatedAxisNV, setDilatedAxisNV, axisOptions)}
                                    </Box>

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
                            </Box>
                        )}
                    </CardContent>
                    {updateLoading && (
                        <Box display='flex' justifyContent='center' mt={1}>
                            <CircularProgress size={20} />
                        </Box>
                    )}
                </Card>
            )}
        </Box>
    );
};

export default PatientRefraction;
