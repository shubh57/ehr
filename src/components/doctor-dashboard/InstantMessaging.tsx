// src/components/doctor-dashboard/InstantMessaging.tsx

// Dependencies remain unchanged
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { UserInterface } from '../../redux/auth/interfaces';
import { invoke } from '@tauri-apps/api/core';
import { useToast } from '@chakra-ui/react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    ListItemButton,
    Avatar,
    TextField,
    IconButton,
    Divider,
    Badge,
    useTheme,
} from '@mui/material';
import { Send as SendIcon, Add as AddIcon } from '@mui/icons-material';
import { ArrowBack } from '@mui/icons-material';

// Type definitions remain unchanged
export type Conversation = {
    conversation_id: number;
    user1: number;
    user2: number;
    last_message: number;
    created_at: string;
    last_message_sender_id: number;
    last_message_content: string;
    last_message_created_at: string;
};

export type Message = {
    message_id: number;
    conversation_id: number;
    sender_id: number;
    content: string;
    created_at: string;
};

export type MessageData = {
    message_id: number;
    conversation_id: number;
    sender_id: number;
    recipient_id: number;
    content: string;
    status: string;
    created_at: string;
};

const InstantMessaging: React.FC = () => {
    const theme = useTheme();
    const toast = useToast();
    const { user, token } = useSelector((state: RootState) => state.auth);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [messageSending, setMessageSending] = useState<boolean>(false);
    const [conversationLoading, setConversationLoading] = useState<boolean>(false);
    const [doctors, setDoctors] = useState<UserInterface[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>();
    const [messages, setMessages] = useState<MessageData[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');

    const getConversationWithUnreadStatus = (convId: number) => {
        return messages.some((msg) => msg.conversation_id === convId && msg.recipient_id === user?.user_id && msg.status !== 'read');
    };

    useEffect(() => {
        fetchDoctors();
        fetchConversations();
        pollMessages();
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation?.conversation_id);
        }
    }, [selectedConversation]);

    const fetchDoctors = async () => {
        try {
            setIsLoading(true);
            const doctorList: UserInterface[] = await invoke('get_all_doctors', { token });
            setDoctors(doctorList.filter((docter) => docter.user_id !== user?.user_id));
        } catch (error) {
            console.error('Error while fetching doctor data: ', error);
        } finally {
            setIsLoading(false);
        }
    };

    const startNewConversation = async (doctorId: number) => {
        try {
            const conversation: Conversation = await invoke('get_conversation', { token, recipientId: doctorId });
            console.log('conversation: ', conversation);
            setSelectedConversation(conversation);
        } catch (error) {
            console.error('Error starting new conversation: ', error);
        }
    };

    const pollMessages = async () => {
        try {
            await invoke('poll_messages', { token });
        } catch (error) {
            console.error('Error polling messages: ', error);
        }
    };

    const fetchMessages = async (conversationId: number) => {
        try {
            setConversationLoading(true);
            const messages: MessageData[] = await invoke('get_messages_for_conversation', { token, conversationId });
            console.log('messages: ', messages);
            setMessages(messages.reverse());
        } catch (error) {
            console.error('Error while fetching messages for conversation: ', error);
        } finally {
            setConversationLoading(false);
        }
    };

    const fetchConversations = async () => {
        try {
            setIsLoading(true);
            const conversations: Conversation[] = await invoke('get_all_conversations', { token });
            setConversations(conversations);
        } catch (error) {
            console.error('Error while fetching conversations: ', error);
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async () => {
        try {
            setMessageSending(true);

            if (!newMessage.trim() || !selectedConversation) {
                throw Error('Please enter a message and select a conversation.');
            }
            console.log('1');
            const message: Message = await invoke('send_message', { token, conversationId: selectedConversation.conversation_id, content: newMessage });
            console.log('message: ', message);
            setNewMessage('');
            fetchMessages(selectedConversation.conversation_id);
            fetchConversations();
        } catch (error) {
            console.error('Error while sending message: ', error);
            toast({
                title: `Error while sending message: ${error}`,
                status: 'error',
                duration: 4000,
                position: 'top',
                isClosable: true,
            });
        } finally {
            setMessageSending(false);
        }
    };

    const getRecipientName = (conversation: Conversation) => {
        const doctor = doctors.find((doc) => doc.user_id === conversation.user1 || doc.user_id === conversation.user2);
        return doctor ? doctor.first_name + ' ' + doctor.last_name : `User ${conversation.user2}`;
    };

    const getLastMessagePreview = (convId: number) => {
        const conversation = conversations.find((msg) => msg.conversation_id === convId);
        if (!conversation?.last_message) return 'No messages yet';

        return conversation.last_message_content.length > 25 ? `${conversation.last_message_content.substring(0, 25)}...` : conversation.last_message_content;
    };

    return (
        <Box sx={{ display: 'flex', height: '100%', borderRadius: 2, overflow: 'hidden', boxShadow: 3, maxHeight: '40rem' }}>
            {/* Conversation sidebar */}
            {!selectedConversation && (
                <Box sx={{ width: '100%', borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant='h6' sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                        Conversations
                    </Typography>
                    <Box sx={{ flex: 1, overflowY: 'auto' }}>
                        {conversations.length === 0 ? (
                            <Typography sx={{ p: 2, color: 'text.secondary' }}>No conversations yet</Typography>
                        ) : (
                            <List>
                                {conversations.map((conv) => {
                                    const hasUnread = getConversationWithUnreadStatus(conv.conversation_id);
                                    return (
                                        <ListItemButton
                                            key={conv.conversation_id}
                                            onClick={() => setSelectedConversation(conv)}
                                            sx={{
                                                bgcolor: hasUnread ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                                                '&:hover': {
                                                    bgcolor: 'rgba(0, 0, 0, 0.08)',
                                                },
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Badge
                                                    color='error'
                                                    variant='dot'
                                                    invisible={!hasUnread}
                                                    overlap='circular'
                                                    anchorOrigin={{
                                                        vertical: 'top',
                                                        horizontal: 'right',
                                                    }}
                                                >
                                                    <Avatar>{getRecipientName(conv).charAt(0)}</Avatar>
                                                </Badge>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={`Dr. ${getRecipientName(conv)}`}
                                                secondary={getLastMessagePreview(conv.conversation_id)}
                                                primaryTypographyProps={{
                                                    fontWeight: hasUnread ? 'bold' : 'normal',
                                                }}
                                            />
                                        </ListItemButton>
                                    );
                                })}
                            </List>
                        )}
                    </Box>
                    <Divider />
                    <Typography variant='subtitle1' sx={{ p: 2 }}>
                        Start New Chat
                    </Typography>
                    <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: '200px' }}>
                        <List>
                            {doctors.map((doctor) => (
                                <ListItemButton key={doctor.user_id} onClick={() => startNewConversation(doctor.user_id)}>
                                    <ListItemAvatar>
                                        <Avatar>{doctor.first_name.charAt(0) + doctor.last_name.charAt(0)}</Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary={`Dr. ${doctor.first_name + ' ' + doctor.last_name}`} />
                                    <IconButton edge='end' size='small'>
                                        <AddIcon />
                                    </IconButton>
                                </ListItemButton>
                            ))}
                        </List>
                    </Box>
                </Box>
            )}

            {/* Message area */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
                {selectedConversation && (
                    <>
                        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
                            <IconButton onClick={() => setSelectedConversation(null)} sx={{ mr: 1 }}>
                                <ArrowBack />
                            </IconButton>
                            <Avatar sx={{ mr: 2 }}>{getRecipientName(selectedConversation).charAt(0)}</Avatar>
                            <Typography variant='h6'>{`Dr. ${getRecipientName(selectedConversation)}`}</Typography>
                        </Box>
                        <Box
                            sx={{
                                flex: 1,
                                overflowY: 'auto',
                                p: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                bgcolor: 'rgba(0, 0, 0, 0.02)',
                            }}
                        >
                            {conversationLoading ? (
                                <Typography align='center' sx={{ color: 'text.secondary', py: 2 }}>
                                    Loading messages...
                                </Typography>
                            ) : messages.length === 0 ? (
                                <Typography align='center' sx={{ color: 'text.secondary', py: 2 }}>
                                    No messages yet. Start the conversation!
                                </Typography>
                            ) : (
                                messages.map((msg) => {
                                    const isCurrentUser = msg.sender_id === user?.user_id;
                                    return (
                                        <Box
                                            key={msg.message_id}
                                            sx={{
                                                mb: 1.5,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    maxWidth: '80%',
                                                    bgcolor: isCurrentUser ? theme.palette.primary.main : '#F5F5F5',
                                                    color: isCurrentUser ? 'white' : 'black',
                                                    p: 1.5,
                                                    borderRadius: 2,
                                                    borderTopRightRadius: isCurrentUser ? 0 : 2,
                                                    borderTopLeftRadius: isCurrentUser ? 2 : 0,
                                                    boxShadow: 1,
                                                }}
                                            >
                                                <Typography variant='body1'>{msg.content}</Typography>
                                            </Box>
                                            <Typography variant='caption' sx={{ mt: 0.5, color: 'text.secondary' }}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {isCurrentUser && <span style={{ marginLeft: '4px' }}>{msg.status === 'read' ? '✓✓' : '✓'}</span>}
                                            </Typography>
                                        </Box>
                                    );
                                })
                            )}
                        </Box>
                        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex' }}>
                            <TextField
                                fullWidth
                                variant='outlined'
                                placeholder='Type a message...'
                                size='small'
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                disabled={messageSending}
                                sx={{ mr: 1 }}
                            />
                            <IconButton
                                color='primary'
                                onClick={sendMessage}
                                disabled={messageSending || !newMessage.trim()}
                                sx={{
                                    bgcolor: theme.palette.primary.main,
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: theme.palette.primary.dark,
                                    },
                                    '&.Mui-disabled': {
                                        bgcolor: 'rgba(0, 0, 0, 0.12)',
                                        color: 'rgba(0, 0, 0, 0.26)',
                                    },
                                }}
                            >
                                <SendIcon />
                            </IconButton>
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
};

export default InstantMessaging;
