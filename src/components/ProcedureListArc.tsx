// src/components/ProcedureListArc.tsx

import { Box, Chip, useTheme } from '@mui/material';
import React from 'react';
import { Procedure } from './PatientProcedureGrid';

const ProcedureListArc: React.FC<{
    procedures: Procedure[];
    onSelectProcedure: (procedure: Procedure) => void;
}> = ({ procedures, onSelectProcedure }) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                position: 'absolute',
                bottom: '60px',
                left: '45%',
                transform: 'translateX(-50%)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                gap: '8px',
                padding: '8px',
                backgroundColor: theme.palette.background.paper,
                borderRadius: '16px',
                boxShadow: theme.shadows[5],
                zIndex: 1,
            }}
        >
            {procedures.map((procedure, index) => {
                const angle = index * 3;
                const offsetY = index * 40;
                const offsetX = index * 50;

                return (
                    <Box
                        key={procedure.procedure_id}
                        sx={{
                            position: 'absolute',
                            top: `-${offsetY}px`,
                            left: `${offsetX}px`,
                            transform: `rotate(${angle}deg)`,
                            transformOrigin: 'bottom center',
                        }}
                    >
                        <Chip
                            label={procedure.procedure_name}
                            onClick={() => onSelectProcedure(procedure)}
                            sx={{
                                cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: 'primary.light',
                                },
                                backgroundColor: theme.palette.background.paper,
                            }}
                        />
                    </Box>
                );
            })}
        </Box>
    );
};

export default ProcedureListArc;
