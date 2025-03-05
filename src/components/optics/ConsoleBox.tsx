// src/components/optics/ConsoleBox.tsx

import { Box, Button, useTheme } from '@mui/material';
import React, { useState } from 'react';

const ConsoleBox: React.FC = () => {
    const theme = useTheme();

    const [dilationStatus, setDilationStatus] = useState<string>('Undilated');

    const handleButtonClick = async (button: string) => {
        switch (button) {
            case 'Dilate': {
                setDilationStatus('Dilating');
                setTimeout(() => {
                    setDilationStatus('Dilated');
                }, 1000);
                break;
            }
            default: {
                console.log('Button: ', button, ' clicked.');
            }
        }
    };

    const dilationColor = (status: string) => {
        switch (status) {
            case 'Undilated':
                return theme.palette.background.paper;
            case 'Dilated':
                return theme.palette.paperGreen.default;
            case 'Dilating':
                return theme.palette.paperYellow.light;
            default:
                return theme.palette.background.paper;
        }
    };

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: '1fr 1fr',
                width: '20rem',
                height: '14rem',
                marginTop: '2rem',
                borderRadius: '12px',
            }}
        >
            {['Dilate', 'Nurse', 'Refer', 'Fundus'].map((label, index) => (
                <Button
                    key={index}
                    variant='contained'
                    onClick={() => handleButtonClick(label)}
                    sx={{
                        width: '100%',
                        height: '100%',
                        fontSize: '18px',
                        borderRadius:
                            index === 0 ? '12px 0px 0px 0px' : index === 1 ? '0px 12px 0px 0px' : index === 2 ? '0px 0px 0px 12px' : '0px 0px 12px 0px',
                        backgroundColor: label === 'Dilate' ? dilationColor(dilationStatus) : theme.palette.background.paper,
                        border: '0.5px solid black',
                        cursor: 'pointer',
                        '&:hover': {
                            backgroundColor: theme.palette.background.paperDark,
                            transform: 'scale(0.98)',
                        },
                        color: theme.palette.common.black
                    }}
                >
                    {label === 'Dilate' ? dilationStatus : label}
                </Button>
            ))}
        </Box>
    );
};

export default ConsoleBox;
