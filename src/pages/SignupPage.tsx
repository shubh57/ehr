// src/pages/SignupPage.tsx

// Dependencies
import React, { useState } from 'react';
import {
    Box,
    TextField,
    Typography,
    useTheme,
    InputAdornment,
    IconButton,
    Link,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Email, Lock } from '@mui/icons-material';
import CustomButton from '../common-components/CustomButton';
import { useToast } from '@chakra-ui/react';
import { invoke } from '@tauri-apps/api/core';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const SignupPage: React.FC = () => {
    const theme = useTheme();
    const toast = useToast();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Form field states
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [role, setRole] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);

    // Error messages for each field
    const [errors, setErrors] = useState<{
        firstName?: string;
        lastName?: string;
        role?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
    }>({});

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    // Basic email regex check
    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const validateForm = (): boolean => {
        let valid = true;
        const newErrors: { [key: string]: string } = {};

        if (!firstName.trim()) {
            newErrors.firstName = 'First name is required.';
            valid = false;
        }
        if (!lastName.trim()) {
            newErrors.lastName = 'Last name is required.';
            valid = false;
        }
        if (!role) {
            newErrors.role = 'Role is required.';
            valid = false;
        }
        if (!email.trim() || !validateEmail(email)) {
            newErrors.email = 'A valid email is required.';
            valid = false;
        }
        if (!password) {
            newErrors.password = 'Password is required.';
            valid = false;
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters.';
            valid = false;
        }
        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match.';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSignup = async () => {
        if (!validateForm()) return;

        try {
            setIsLoading(true);
            // Invoke the backend signup command passing all the required fields
            await invoke('signup', { signupQuery: { first_name: firstName, last_name: lastName, role: role.toUpperCase(), email, password } });
            toast({
                title: 'Signup successful',
                status: 'success',
                duration: 4000,
                isClosable: true,
                position: 'top',
            });
            navigate('/login');
        } catch (error) {
            console.error('Error while signing up:', error);
            toast({
                title: `Error while signing up: ${error}`,
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
                        color: theme.palette.common.white,
                    }}
                >
                    <Typography variant='h3' component='h1' sx={{ fontWeight: 500 }}>
                        EHR Portal
                    </Typography>
                </Box>

                <Box sx={{ padding: '32px' }}>
                    <Typography variant='h5' sx={{ mb: 3, fontWeight: 500, textAlign: 'center' }}>
                        Create an Account
                    </Typography>

                    <Box component='form' noValidate autoComplete='off'>
                        <TextField
                            label='First Name'
                            variant='outlined'
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            fullWidth
                            sx={{ mb: 3 }}
                            error={Boolean(errors.firstName)}
                            helperText={errors.firstName}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position='start'>
                                        <Person color='action' />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            label='Last Name'
                            variant='outlined'
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            fullWidth
                            sx={{ mb: 3 }}
                            error={Boolean(errors.lastName)}
                            helperText={errors.lastName}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position='start'>
                                        <Person color='action' />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <FormControl fullWidth required sx={{ mb: 3 }} error={Boolean(errors.role)}>
                            <InputLabel id='role-label'>Role</InputLabel>
                            <Select labelId='role-label' value={role} label='Role' onChange={(e) => setRole(e.target.value)}>
                                <MenuItem value='Doctor'>Doctor</MenuItem>
                                <MenuItem value='Nurse'>Nurse</MenuItem>
                                <MenuItem value='Admin'>Admin</MenuItem>
                            </Select>
                            {errors.role && (
                                <Typography variant='caption' color='error'>
                                    {errors.role}
                                </Typography>
                            )}
                        </FormControl>

                        <TextField
                            label='Email'
                            variant='outlined'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            fullWidth
                            sx={{ mb: 3 }}
                            error={Boolean(errors.email)}
                            helperText={errors.email}
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
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            fullWidth
                            sx={{ mb: 3 }}
                            error={Boolean(errors.password)}
                            helperText={errors.password}
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

                        <TextField
                            label='Confirm Password'
                            type={showPassword ? 'text' : 'password'}
                            variant='outlined'
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            fullWidth
                            sx={{ mb: 3 }}
                            error={Boolean(errors.confirmPassword)}
                            helperText={errors.confirmPassword}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position='start'>
                                        <Lock color='action' />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <CustomButton fullWidth size='large' variant='contained' onClick={handleSignup} disabled={isLoading} sx={{ width: '100%' }}>
                            {isLoading ? <CircularProgress /> : 'Signup'}
                        </CustomButton>

                        <Divider sx={{ my: 2 }}>
                            <Typography variant='body2' color='text.secondary'>
                                OR
                            </Typography>
                        </Divider>

                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant='body2' color='text.secondary'>
                                Already have an account?{' '}
                                <Link onClick={() => navigate('/login')} underline='hover' fontWeight='500' sx={{ cursor: 'pointer' }}>
                                    Login
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

export default SignupPage;
