// src/components/PatientProcedureGrid.tsx

import { Box, Typography, Chip, TextField, useTheme, IconButton, InputAdornment, CircularProgress } from '@mui/material';
import { invoke } from '@tauri-apps/api/core';
import React, { useEffect, useState } from 'react';
import SendIcon from '@mui/icons-material/Send';
import { useToast } from '@chakra-ui/react';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ProcedureDetailsModal from './ProcedureDetailsModal';
import ProcedureListArc from './ProcedureListArc';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useQuery, useQueryClient } from 'react-query';

interface PatientProcedureGridProps {
    patient_id: number;
}

export type PatientProcedureData = {
    activity_id: number;
    status: string;
    procedure_name: string;
    procedure_description: string;
    doctors_note: string;
    patient_complaint: string;
    comments: string[];
    activity_time: string;
};

export type Procedure = {
    procedure_id: number;
    procedure_name: string;
    description: string;
    created_at: string;
};

// This is the shape of the data returned by the API.
interface PatientProcedureDataFromAPI {
    activity_id: number;
    status: string;
    procedure_name: string;
    procedure_description: string;
    doctors_note: string;
    patient_complaint: string;
    comments: string; // newline-separated comments
    activity_time: string;
}

// Utility function to sanitize comments
const sanitizeComments = (comments: string): string[] => {
    return comments
        .split('\n')
        .map((comment) => comment.trim())
        .filter((comment) => comment !== '');
};

// Fetch function returns an array of sanitized patient procedures.
const fetchPatientProcedureData = async (patientId: number): Promise<PatientProcedureData[]> => {
    const data = await invoke<PatientProcedureDataFromAPI[]>('get_patient_procedures', { patientId });
    return data.map((proc) => ({
        ...proc,
        comments: proc.comments ? sanitizeComments(proc.comments) : [],
    }));
};

const fetchAllProcedures = async (): Promise<Procedure[]> => {
    return await invoke<Procedure[]>('get_all_procedures');
};

const PatientProcedureGrid: React.FC<PatientProcedureGridProps> = ({ patient_id }) => {
    const theme = useTheme();
    const toast = useToast();
    const queryClient = useQueryClient();

    const [patientProcedureData, setPatientProcedureData] = useState<PatientProcedureData[]>([]);
    const [allProcedures, setAllProcedures] = useState<Procedure[]>([]);
    const [hoveredProcedureId, setHoveredProcedureId] = useState<number | null>(null);
    const [newComment, setNewComment] = useState<string[]>([]);
    const [commentLoading, setCommentLoading] = useState<boolean[]>([]);
    const [showProcedureList, setShowProcedureList] = useState<boolean>(false);
    const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);

    const proceduresQuery = useQuery<PatientProcedureData[], Error>(['patient_procedures', patient_id], () => fetchPatientProcedureData(patient_id));
    const allProceduresQuery = useQuery<Procedure[], Error>(['all_procedures'], () => fetchAllProcedures());

    const isLoading = proceduresQuery.isLoading || allProceduresQuery.isLoading;

    useEffect(() => {
        if (proceduresQuery.data) {
            setPatientProcedureData(proceduresQuery.data);
        }
    }, [proceduresQuery.data]);

    useEffect(() => {
        if (allProceduresQuery.data) {
            setAllProcedures(allProceduresQuery.data);
        }
    }, [allProceduresQuery.data]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return theme.palette.paperGreen.default;
            case 'TO_BE_REVIEWED':
                return theme.palette.paperYellow.light;
            case 'INCOMPLETE':
                return theme.palette.paperRed.default;
            default:
                return theme.palette.text.primary;
        }
    };

    const getLabel = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'COMPLETED';
            case 'TO_BE_REVIEWED':
                return 'PENDING';
            case 'INCOMPLETE':
                return 'INCOMPLETE';
            default:
                return status.toUpperCase();
        }
    };

    const handleCommentSubmit = async (index: number) => {
        try {
            const updatedLoading = [...commentLoading];
            updatedLoading[index] = true;
            setCommentLoading(updatedLoading);

            const comment = newComment[index].trim();
            if (comment.length === 0) {
                throw Error('Please enter comment before submitting.');
            }

            await invoke('add_comment_to_procedure', { activityId: patientProcedureData[index].activity_id, comment: comment });
            queryClient.invalidateQueries(['patient_procedures', patient_id]);
        } catch (error) {
            console.error('Error while submitting comment: ', error);
            toast({
                title: `Error while submitting comment: ${error}`,
                status: 'error',
                duration: 4000,
                isClosable: true,
                position: 'top',
            });
        } finally {
            const updatedLoading = [...commentLoading];
            updatedLoading[index] = false;
            setCommentLoading(updatedLoading);
        }
    };

    const handleSelectProcedure = (procedure: Procedure) => {
        setSelectedProcedure(procedure);
        setShowProcedureList(false);
    };

    const onDragEnd = (result: any) => {
        if (!result.destination) return;

        const items = [...patientProcedureData];
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setPatientProcedureData(items);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
            }}
        >
            <Box
                sx={{
                    padding: '16px',
                    backgroundColor: theme.palette.common.white,
                    borderRadius: '8px',
                    boxShadow: theme.shadows[2],
                    width: '100%',
                    marginTop: '2rem',
                }}
            >
                <Typography variant='h6' fontWeight='bold' mb={5}>
                    Procedures
                </Typography>

                {isLoading ? (
                    <Typography variant='body1' color='textSecondary'>
                        Loading procedures...
                    </Typography>
                ) : patientProcedureData.length === 0 ? (
                    <Typography variant='body1' color='textSecondary'>
                        No procedures found for this patient.
                    </Typography>
                ) : (
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId='procedures'>
                            {(provided: any) => (
                                <Box
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 4,
                                    }}
                                >
                                    {patientProcedureData.map((procedure, index) => (
                                        <Draggable key={procedure.activity_id} draggableId={String(procedure.activity_id)} index={index}>
                                            {(provided: any, snapshot: any) => (
                                                <Box
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    key={procedure.activity_id}
                                                    onMouseEnter={() => setHoveredProcedureId(procedure.activity_id)}
                                                    onMouseLeave={() => setHoveredProcedureId(null)}
                                                    sx={{
                                                        flex: '0 0 calc(33.333% - 16px)',
                                                        backgroundColor: getStatusColor(procedure.status),
                                                        borderRadius: '8px',
                                                        padding: 8,
                                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                                        transform:
                                                            hoveredProcedureId === procedure.activity_id && !showProcedureList && !snapshot.isDragging
                                                                ? 'scale(1.02)'
                                                                : 'none',
                                                        boxShadow:
                                                            hoveredProcedureId === procedure.activity_id && !showProcedureList && !snapshot.isDragging
                                                                ? theme.shadows[5]
                                                                : theme.shadows[2],
                                                        zIndex:
                                                            hoveredProcedureId === procedure.activity_id && !showProcedureList && !snapshot.isDragging
                                                                ? 1
                                                                : 'auto',
                                                        height: 'fit-content',
                                                        position: 'relative',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 3,
                                                        cursor: 'grab',
                                                        border: '1px solid black',
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        <Typography variant='body1' fontWeight='bold'>
                                                            {procedure.procedure_name}
                                                        </Typography>
                                                        <Chip
                                                            label={getLabel(procedure.status)}
                                                            sx={{
                                                                backgroundColor: theme.palette.background.paper,
                                                                color: 'black',
                                                                fontWeight: 'bold',
                                                            }}
                                                        />
                                                    </Box>

                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant='body2'>
                                                            {new Date(procedure.activity_time).toLocaleString('en-GB', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric',
                                                                hour: 'numeric',
                                                                minute: '2-digit',
                                                                hour12: true,
                                                            })}
                                                        </Typography>
                                                    </Box>

                                                    {hoveredProcedureId === procedure.activity_id && !showProcedureList && !snapshot.isDragging && (
                                                        <Box
                                                            sx={{
                                                                mt: 1,
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: 1,
                                                            }}
                                                        >
                                                            {procedure.procedure_description && (
                                                                <Typography variant='body2'>
                                                                    <strong>Description:</strong> {procedure.procedure_description}
                                                                </Typography>
                                                            )}
                                                            {procedure.doctors_note && (
                                                                <Typography variant='body2'>
                                                                    <strong>Doctor's Note:</strong> {procedure.doctors_note}
                                                                </Typography>
                                                            )}
                                                            {procedure.patient_complaint && (
                                                                <Typography variant='body2'>
                                                                    <strong>Patient Complaint:</strong> {procedure.patient_complaint}
                                                                </Typography>
                                                            )}
                                                            {procedure.comments.length > 0 && (
                                                                <Typography variant='body2'>
                                                                    <strong>Comments:</strong>
                                                                </Typography>
                                                            )}
                                                            {procedure.comments.length > 0 ? (
                                                                procedure.comments.map((comment, index) => (
                                                                    <Typography key={index} variant='body2' sx={{ mt: 1, color: 'text.secondary' }}>
                                                                        • {comment}
                                                                    </Typography>
                                                                ))
                                                            ) : (
                                                                <Typography variant='body2' sx={{ mt: 1, color: 'text.secondary', fontStyle: 'italic' }}>
                                                                    No comments yet
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    )}

                                                    <TextField
                                                        placeholder='Add comment'
                                                        variant='outlined'
                                                        size='small'
                                                        value={newComment[index] || ''}
                                                        onChange={(e) => {
                                                            const updatedComments = [...newComment];
                                                            updatedComments[index] = e.target.value;
                                                            setNewComment(updatedComments);
                                                        }}
                                                        onKeyDown={async (e) => {
                                                            if (e.key === 'Enter') {
                                                                await handleCommentSubmit(index);
                                                            }
                                                        }}
                                                        fullWidth
                                                        sx={{ mt: 2 }}
                                                        InputProps={{
                                                            endAdornment: (
                                                                <InputAdornment position='end'>
                                                                    <IconButton
                                                                        color='primary'
                                                                        onClick={async () => await handleCommentSubmit(index)}
                                                                        sx={{ ml: 1 }}
                                                                    >
                                                                        {commentLoading[index] ? <CircularProgress size={20} /> : <SendIcon />}
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                    />
                                                </Box>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </Box>
                            )}
                        </Droppable>
                    </DragDropContext>
                )}
            </Box>

            {!isLoading && (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: '16px',
                        position: 'relative',
                    }}
                >
                    <IconButton
                        color='primary'
                        onClick={() => setShowProcedureList(!showProcedureList)}
                        sx={{
                            backgroundColor: theme.palette.primary.main,
                            color: theme.palette.common.white,
                            '&:hover': {
                                backgroundColor: theme.palette.primary.dark,
                            },
                        }}
                    >
                        {showProcedureList ? <RemoveIcon /> : <AddIcon />}
                    </IconButton>

                    {showProcedureList && <ProcedureListArc procedures={allProcedures} onSelectProcedure={handleSelectProcedure} />}
                </Box>
            )}

            <ProcedureDetailsModal
                procedure={selectedProcedure}
                patient_id={patient_id}
                onClose={async () => {
                    setSelectedProcedure(null);
                    queryClient.invalidateQueries(['patient_procedures', patient_id]);
                }}
            />
        </Box>
    );
};

export default PatientProcedureGrid;
