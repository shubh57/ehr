// src/components/optics/PatientRefraction.tsx

// Dependencies
import { useToast } from '@chakra-ui/react';
import { Box, CircularProgress, Typography, IconButton, Divider, CardContent, Card, Select, MenuItem } from '@mui/material';
import { invoke } from '@tauri-apps/api/core';
import React, { useEffect, useState } from 'react';
import { Lock, LockOpen } from '@mui/icons-material';
import ShimmerPatientRefraction from './ShimmerPatientRefraction';
import { useQuery, useQueryClient } from 'react-query';

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

const fetchRefractionData = async (patient_id: number, side: string, value_type: string, vision_type: string): Promise<RefractionData> => {
    return await invoke<RefractionData>('get_refraction_data', {
        query: { patient_id, side, value_type, vision_type },
    });
};

const PatientRefraction: React.FC<{
    patient_id: number;
    side: string;
}> = ({ patient_id, side }) => {
    const toast = useToast();
    const queryClient = useQueryClient();

    // Local state for editing values
    const [sphericalDV, setSphericalDV] = useState<string>('');
    const [cylindricalDV, setCylindricalDV] = useState<string>('');
    const [axisDV, setAxisDV] = useState<string>('');

    const [sphericalNV, setSphericalNV] = useState<string>('');
    const [cylindricalNV, setCylindricalNV] = useState<string>('');
    const [axisNV, setAxisNV] = useState<string>('');

    const [dilatedSphericalDV, setDilatedSphericalDV] = useState<string>('');
    const [dilatedCylindricalDV, setDilatedCylindricalDV] = useState<string>('');
    const [dilatedAxisDV, setDilatedAxisDV] = useState<string>('');

    const [dilatedSphericalNV, setDilatedSphericalNV] = useState<string>('');
    const [dilatedCylindricalNV, setDilatedCylindricalNV] = useState<string>('');
    const [dilatedAxisNV, setDilatedAxisNV] = useState<string>('');

    // Used for toggling edit mode and update loading state.
    const [isLocked, setIsLocked] = useState<boolean>(true);
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [updateLoading, setUpdateLoading] = useState<boolean>(false);

    // Create queries for each combination.
    const udDVQuery = useQuery<RefractionData, Error>(['refraction', patient_id, side, 'UD', 'DV'], () => fetchRefractionData(patient_id, side, 'UD', 'DV'));
    const dlDVQuery = useQuery<RefractionData, Error>(['refraction', patient_id, side, 'DL', 'DV'], () => fetchRefractionData(patient_id, side, 'DL', 'DV'));
    const udNVQuery = useQuery<RefractionData, Error>(['refraction', patient_id, side, 'UD', 'NV'], () => fetchRefractionData(patient_id, side, 'UD', 'NV'));
    const dlNVQuery = useQuery<RefractionData, Error>(['refraction', patient_id, side, 'DL', 'NV'], () => fetchRefractionData(patient_id, side, 'DL', 'NV'));

    // Derive a global loading flag from all queries.
    const isLoading = udDVQuery.isLoading || dlDVQuery.isLoading || udNVQuery.isLoading || dlNVQuery.isLoading;

    // When data is successfully fetched, initialize the local state
    useEffect(() => {
        if (udDVQuery.data) {
            setSphericalDV(udDVQuery.data.spherical || 'N/A');
            setCylindricalDV(udDVQuery.data.cylindrical || 'N/A');
            setAxisDV(udDVQuery.data.axis || 'N/A');
        }
    }, [udDVQuery.data]);

    useEffect(() => {
        if (udNVQuery.data) {
            setSphericalNV(udNVQuery.data.spherical || 'N/A');
            setCylindricalNV(udNVQuery.data.cylindrical || 'N/A');
            setAxisNV(udNVQuery.data.axis || 'N/A');
        }
    }, [udNVQuery.data]);

    useEffect(() => {
        if (dlDVQuery.data) {
            setDilatedSphericalDV(dlDVQuery.data.spherical || 'N/A');
            setDilatedCylindricalDV(dlDVQuery.data.cylindrical || 'N/A');
            setDilatedAxisDV(dlDVQuery.data.axis || 'N/A');
        }
    }, [dlDVQuery.data]);

    useEffect(() => {
        if (dlNVQuery.data) {
            setDilatedSphericalNV(dlNVQuery.data.spherical || 'N/A');
            setDilatedCylindricalNV(dlNVQuery.data.cylindrical || 'N/A');
            setDilatedAxisNV(dlNVQuery.data.axis || 'N/A');
        }
    }, [dlNVQuery.data]);

    // Update refraction data and then invalidate (refetch) the relevant query
    const handleRefractionUpdate = async (
        value_type: string,
        vision_type: string,
        params: {
            spherical: string;
            cylindrical: string;
            axis: string;
        },
    ) => {
        try {
            setUpdateLoading(true);
            await invoke('update_refraction_data', {
                patientId: patient_id,
                spherical: params.spherical,
                cylindrical: params.cylindrical,
                axis: params.axis,
                side: side,
                valueType: value_type,
                visionType: vision_type,
                updatedBy: 1,
            });
            // Invalidate the corresponding query to refetch updated data
            queryClient.invalidateQueries(['refraction', patient_id, side, value_type, vision_type]);
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

    // When locking the component (i.e. finishing editing) update all four types
    const toggleLock = async () => {
        if (!isLocked) {
            await handleRefractionUpdate('UD', 'DV', {
                spherical: sphericalDV,
                cylindrical: cylindricalDV,
                axis: axisDV,
            });
            await handleRefractionUpdate('DL', 'DV', {
                spherical: dilatedSphericalDV,
                cylindrical: dilatedCylindricalDV,
                axis: dilatedAxisDV,
            });
            await handleRefractionUpdate('UD', 'NV', {
                spherical: sphericalNV,
                cylindrical: cylindricalNV,
                axis: axisNV,
            });
            await handleRefractionUpdate('DL', 'NV', {
                spherical: dilatedSphericalNV,
                cylindrical: dilatedCylindricalNV,
                axis: dilatedAxisNV,
            });
        }
        setIsLocked(!isLocked);
    };

    const handleDoubleClick = () => {
        setIsExpanded(!isExpanded);
    };

    // Helper to render a value or a dropdown depending on the lock state
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
                <ShimmerPatientRefraction />
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
                            {(udDVQuery.data || dlDVQuery.data || udNVQuery.data || dlNVQuery.data) && (
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
                                    {udDVQuery.data?.updated_at || udDVQuery.data?.created_at
                                        ? new Date((udDVQuery.data?.updated_at || udDVQuery.data?.created_at).toString()).toLocaleString('en-GB', {
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
                                {/* Header for Dilated Values */}
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
                                {/* Dilated Distance Vision (DV) Values */}
                                <Box sx={{ position: 'relative' }}>
                                    <Typography variant='body2' fontWeight='bold' color='text.secondary'>
                                        DV
                                    </Typography>
                                    <Box display='flex' justifyContent='space-around' alignItems='center'>
                                        {renderValueOrDropdown(dilatedSphericalDV, setDilatedSphericalDV, sphericalCylindricalOptions)}
                                        {renderValueOrDropdown(dilatedCylindricalDV, setDilatedCylindricalDV, sphericalCylindricalOptions)}
                                        {renderValueOrDropdown(dilatedAxisDV, setDilatedAxisDV, axisOptions)}
                                    </Box>
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
                                <Divider sx={{ width: '100%', my: 1 }} />
                                {/* Dilated Near Vision (NV) Values */}
                                <Box sx={{ position: 'relative' }}>
                                    <Typography variant='body2' fontWeight='bold' color='text.secondary'>
                                        NV
                                    </Typography>
                                    <Box display='flex' justifyContent='space-around' alignItems='center'>
                                        {renderValueOrDropdown(dilatedSphericalNV, setDilatedSphericalNV, sphericalCylindricalOptions)}
                                        {renderValueOrDropdown(dilatedCylindricalNV, setDilatedCylindricalNV, sphericalCylindricalOptions)}
                                        {renderValueOrDropdown(dilatedAxisNV, setDilatedAxisNV, axisOptions)}
                                    </Box>
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
