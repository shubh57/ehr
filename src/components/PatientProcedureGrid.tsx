// src/components/PatientProcedureGrid.tsx

import { Box, Typography, Chip, TextField, useTheme, IconButton, InputAdornment, CircularProgress } from "@mui/material";
import { invoke } from "@tauri-apps/api/core";
import React, { useEffect, useState } from "react";
import SendIcon from "@mui/icons-material/Send";
import { useToast } from "@chakra-ui/react";

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

const PatientProcedureGrid: React.FC<PatientProcedureGridProps> = ({
    patient_id
}) => {
    const theme = useTheme();
    const toast = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [patientProcedureData, setPatientProcedureData] = useState<PatientProcedureData[]>([]);
    const [allProcedures, setAllProcedures] = useState<Procedure[]>([]);
    const [hoveredProcedureId, setHoveredProcedureId] = useState<number | null>(null);
    const [newComment, setNewComment] = useState<string[]>([]);
    const [commentLoading, setCommentLoading] = useState<boolean[]>([]);

    const santizeComments = (comments: string) => {
        let commentsArray = comments.split('\\n');
        const filteredCommentsArray = commentsArray.filter(comment => comment.trim() !== "");
        return filteredCommentsArray;
    }

    const fetchPatientProcedureData = async () => {
        try {
            setIsLoading(true);
            const data: any[] = await invoke('get_patient_procedures', {patientId: patient_id});
            console.log("data: ", data);
            const parsedData = data.map(proc => ({
                ...proc,
                comments: proc.comments ? santizeComments(proc.comments) : []
            })) as PatientProcedureData[]; 

            const dummyData: PatientProcedureData[] = Array.from({ length: 15 }, (_, index) => ({
                activity_id: index + 1,
                status: index % 3 === 0 ? 'COMPLETED' : index % 3 === 1 ? 'TO_BE_REVIEWED' : 'INCOMPLETE',
                procedure_name: `Procedure ${index + 1}`,
                procedure_description: `This is a description for Procedure ${index + 1}.`,
                doctors_note: `Doctor's note for Procedure ${index + 1}.`,
                patient_complaint: `Complaint for Procedure ${index + 1}.`,
                comments: index % 2 === 0 ? [`Comment ${index + 1}`] : [],
                activity_time: new Date(Date.now() - index * 10000000).toISOString(),
            }));

            setNewComment(Array.from({ length: parsedData.length}, () => ""));
            setCommentLoading(Array.from({length: parsedData.length}, () => false));
            setPatientProcedureData(parsedData);
        } catch (error) {
            console.error("Error while fetching patient procedure data: ", error);
            toast({
                title: `Error while fetching patient procedure data: ${error}`,
                status: 'error',
                duration: 4000,
                isClosable: true,
                position: 'top',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAllProcedures = async () => {
        try {
            setIsLoading(true);
            const data: Procedure[] = await invoke('get_all_procedures');
            setAllProcedures(data);
        } catch (error) {
            console.error("Error while fetching procedures data: ", error);
            toast({
                title: `Error while fetching procedures data: ${error}`,
                status: 'error',
                duration: 4000,
                isClosable: true,
                position: 'top',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPatientProcedureData();
        fetchAllProcedures();
    }, [patient_id]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return theme.palette.success.main;
            case 'TO_BE_REVIEWED':
                return theme.palette.warning.main;
            case 'INCOMPLETE':
                return theme.palette.error.main;
            default:
                return theme.palette.text.primary;
        }
    };

    const getTextColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
            case 'TO_BE_REVIEWED':
                return theme.palette.common.black;
            default:
                return theme.palette.common.white;
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
                throw Error("Please enter comment before submitting.");
            }

            const data: any = await invoke('add_comment_to_procedure', {activityId: patientProcedureData[index].activity_id, comment: comment});
            await fetchPatientProcedureData();
        } catch (error) {
            console.error("Error while submitting comment: ", error);
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

    return (
        <Box
            sx={{
                padding: '16px',
                backgroundColor: theme.palette.secondary.main,
                borderRadius: '8px',
                boxShadow: theme.shadows[2],
                width: '100%',
                marginTop: '2rem'
            }}
        >
            <Typography variant='h6' fontWeight='bold' mb={2}>
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
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 4,
                    }}
                >
                    {patientProcedureData.map((procedure, index) => (
                        <Box
                            key={procedure.activity_id}
                            onMouseEnter={() => setHoveredProcedureId(procedure.activity_id)}
                            onMouseLeave={() => setHoveredProcedureId(null)}
                            sx={{
                                flex: '0 0 calc(33.333% - 16px)',
                                backgroundColor: theme.palette.background.paperDark,
                                borderRadius: '8px',
                                padding: 8,
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                transform: hoveredProcedureId === procedure.activity_id ? 'scale(1.02)' : 'none',
                                boxShadow: hoveredProcedureId === procedure.activity_id ? theme.shadows[5] : theme.shadows[2],
                                zIndex: hoveredProcedureId === procedure.activity_id ? 1 : 'auto',
                                height: 'fit-content',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body1" fontWeight="bold">
                                    {procedure.procedure_name}
                                </Typography>
                                <Chip
                                    label={getLabel(procedure.status)}
                                    sx={{
                                        backgroundColor: getStatusColor(procedure.status),
                                        color: getTextColor(procedure.status),
                                        fontWeight: 'bold',
                                    }}
                                />
                            </Box>

                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" color="text.secondary">
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

                            {hoveredProcedureId === procedure.activity_id && (
                                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {procedure.procedure_description && (
                                        <Typography variant="body2">
                                            <strong>Description:</strong> {procedure.procedure_description}
                                        </Typography>
                                    )}
                                    {procedure.doctors_note && (
                                        <Typography variant="body2">
                                            <strong>Doctor's Note:</strong> {procedure.doctors_note}
                                        </Typography>
                                    )}
                                    {procedure.patient_complaint && (
                                        <Typography variant="body2">
                                            <strong>Patient Complaint:</strong> {procedure.patient_complaint}
                                        </Typography>
                                    )}
                                    {procedure.comments.length > 0 && (
                                        <Typography variant="body2">
                                            <strong>Comments:</strong>
                                        </Typography>
                                    )}
                                    {procedure.comments.length > 0 ? (
                                        procedure.comments.map((comment, index) => (
                                            <Typography key={index} variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                                                • {comment}
                                            </Typography>
                                        ))
                                    ) : (
                                        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', fontStyle: 'italic' }}>
                                            No comments yet
                                        </Typography>
                                    )}
                                </Box>
                            )}

                            <TextField
                                placeholder="Add comment"
                                variant="outlined"
                                size="small"
                                value={newComment[index] || ""}
                                onChange={(e) => {
                                    const updatedComments = [...newComment];
                                    updatedComments[index] = e.target.value;
                                    setNewComment(updatedComments);
                                }}
                                onKeyDown={async (e) => {
                                    if (e.key === 'Enter') {
                                        await handleCommentSubmit(index)
                                    }
                                }}
                                fullWidth
                                sx={{ mt: 2 }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                color="primary"
                                                onClick={async () => await handleCommentSubmit(index)}
                                                sx={{ ml: 1 }}
                                            >
                                                {commentLoading[index] ? <CircularProgress size={20} /> : <SendIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default PatientProcedureGrid;