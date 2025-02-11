// src/components/optics/ConsoleBox.tsx

import { Box, Button, useTheme } from '@mui/material';
import React from 'react';

const ConsoleBox: React.FC = () => {
    const theme = useTheme();

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
                    sx={{
                        width: '100%',
                        height: '100%',
                        fontSize: '18px',
                        borderRadius:
                            index === 0 ? '12px 0px 0px 0px' : index === 1 ? '0px 12px 0px 0px' : index === 2 ? '0px 0px 0px 12px' : '0px 0px 12px 0px',
                        backgroundColor: theme.palette.background.paper,
                        border: '0.5px solid black',
                        cursor: 'pointer',
                        '&:hover': {
                            backgroundColor: theme.palette.background.paperDark,
                            transform: 'scale(0.98)',
                        },
                    }}
                >
                    {label}
                </Button>
            ))}
        </Box>
    );
};

export default ConsoleBox;
