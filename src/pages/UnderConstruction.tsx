// src/pages/UnderConstruction.tsx

// Dependencies
import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';

const UnderConstruction = () => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 'calc(100vh - 88px)', // Subtract navbar height
                padding: '24px',
                backgroundColor: theme.palette.background.default,
            }}
        >
            <ConstructionIcon
                sx={{
                    fontSize: 80,
                    color: theme.palette.secondary.dark,
                    marginBottom: 3,
                }}
            />
            <Typography
                variant='h3'
                sx={{
                    color: theme.palette.text.primary,
                    marginBottom: 2,
                    textAlign: 'center',
                }}
            >
                Under Construction
            </Typography>
            <Typography
                variant='h4'
                sx={{
                    color: theme.palette.text.secondary,
                    textAlign: 'center',
                    maxWidth: 600,
                }}
            >
                Home Dashboard
            </Typography>
        </Box>
    );
};

export default UnderConstruction;
