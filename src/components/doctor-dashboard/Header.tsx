// src/components/doctor-dashboard/Header.tsx

// Dependencies
import { Box, Button, IconButton, InputBase, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { clearCredentials } from "../../redux/auth/authSlice";

const Header: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();

    const [currentTime, setCurrentTime] = useState(new Date().toLocaleString('en-GB'));
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date().toLocaleString('en-GB'));
        }, 1000); // Update every second

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    return (
        <Box display='flex' justifyContent='space-between' alignItems='center' p={2} borderBottom='1px solid #ccc' gap='2rem' minHeight='3rem' maxHeight='3rem'>
            <Typography variant='h4'>Welcome, Dr. {user?.first_name + " " + user?.last_name}</Typography>
            <Box display='flex' alignItems='center'>
                <Typography variant='body1' mr={2}>
                    {currentTime}
                </Typography>

                {/* Search Box */}
                {searchOpen ? (
                    <Box display='flex' alignItems='center' border='1px solid #ccc' borderRadius={2} px={1} margin="0.5rem">
                        <InputBase
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ ml: 1, flex: 1 }}
                        />
                        <IconButton color='primary' onClick={() => setSearchOpen(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                ) : (
                    <IconButton color='primary' onClick={() => setSearchOpen(true)}>
                        <SearchIcon />
                    </IconButton>
                )}

                <Button variant='outlined' startIcon={<LogoutIcon />} onClick={() => dispatch(clearCredentials())}>
                    Logout
                </Button>
            </Box>
        </Box>
    );
};

export default Header;
