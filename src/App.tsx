// src/pages/UnderConstruction.tsx

// Dependencies
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, useTheme } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';
import AllRoutes from './components/AllRoutes';

const App = () => {
    const theme = useTheme();
    const navigate = useNavigate();

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
            <AllRoutes />
        </Box>
    );
};

export default App;
