import React, { useState } from 'react';
import { Box, TextField, Button, Typography, useTheme, InputAdornment, IconButton, Link, Divider, CircularProgress } from '@mui/material';
import { Visibility, VisibilityOff, HealthAndSafety, Email, Lock } from '@mui/icons-material';
import CustomButton from '../common-components/CustomButton';
import { useToast } from '@chakra-ui/react';
import { invoke } from '@tauri-apps/api/core';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials } from '../redux/auth/authSlice';

const LoginPage: React.FC = () => {
    const theme = useTheme();
    const toast = useToast();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = async () => {
        try {
            setIsLoading(true);

            const data: any = await invoke('login', { email, password });
            console.log("data: ", data);

            if (!data || !data.token || !data.user) {
                throw Error(data.error || "Error while loggin in");
            }

            toast({
                title: `Logged in successfully`,
                status: 'success',
                duration: 4000,
                isClosable: true,
                position: 'top',
            });
            dispatch(setCredentials({ token: data?.token, user: data.user }));
            navigate('/');
        } catch (error) {
            console.error('Error while logging in: ', error);
            toast({
                title: `Error while logging in: ${error}`,
                status: 'error',
                duration: 4000,
                isClosable: true,
                position: 'top',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box
            sx={{
                width: '100%',
                height: '95vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                margin: 0,
            }}
        >
            <Box
                sx={{
                    width: '100%',
                    maxWidth: 450,
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: theme.palette.common.white,
                }}
            >
                <Box
                    sx={{
                        backgroundColor: theme.palette.primary.main,
                        padding: '24px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '12px',
                        color: theme.palette.common.black,
                    }}
                >
                    <Typography variant='h3' component='h1' sx={{ color: theme.palette.common.white, fontWeight: 500 }}>
                        EHR Portal
                    </Typography>
                </Box>

                <Box sx={{ padding: '32px' }}>
                    <Typography variant='h5' sx={{ mb: 3, fontWeight: 500, textAlign: 'center' }}>
                        Welcome Back
                    </Typography>

                    <Box component='form' noValidate autoComplete='off'>
                        <TextField
                            label='Email'
                            variant='outlined'
                            value={email}
                            onChange={(e: any) => setEmail(e.target.value)}
                            required
                            fullWidth
                            sx={{ mb: 3 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position='start'>
                                        <Email color='action' />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            label='Password'
                            type={showPassword ? 'text' : 'password'}
                            variant='outlined'
                            value={password}
                            required
                            onChange={(e: any) => setPassword(e.target.value)}
                            fullWidth
                            sx={{ mb: 2 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position='start'>
                                        <Lock color='action' />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position='end'>
                                        <IconButton aria-label='toggle password visibility' onClick={handleClickShowPassword} edge='end'>
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                            <Link href='#' underline='hover' variant='body2'>
                                Forgot password?
                            </Link>
                        </Box>

                        <CustomButton
                            fullWidth
                            size='large'
                            variant='contained'
                            onClick={handleLogin}
                            sx={{
                                width: '100%',
                            }}
                        >
                            {isLoading ? <CircularProgress />: "Login"}
                        </CustomButton>

                        <Divider sx={{ my: 2 }}>
                            <Typography variant='body2' color='text.secondary'>
                                OR
                            </Typography>
                        </Divider>

                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant='body2' color='text.secondary'>
                                Don't have an account?{' '}
                                <Link onClick={() => navigate('/signup')} underline='hover' fontWeight='500' sx={{ cursor: 'pointer' }}>
                                    Register
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Typography variant='body2' color='text.secondary' sx={{ mt: 4 }}>
                © {new Date().getFullYear()} EHR Portal. All rights reserved.
            </Typography>
        </Box>
    );
};

export default LoginPage;
