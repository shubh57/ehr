// src/common-components/CustomButton.tsx

import React from 'react';
import { Button, ButtonProps, CircularProgress } from '@mui/material';

// Define types for custom properties, extending Material-UI's ButtonProps
interface CustomButtonProps extends ButtonProps {
    customVariant?: 'text' | 'outlined' | 'contained'; // Allow variant customization (text, outlined, contained)
    sx?: object; // For passing any custom styles using the sx prop
    onClick: () => void; // onClick handler
    children: React.ReactNode; // Button text or content
    isLoading?: boolean; // Optional loading state
    isDisabled?: boolean; // Optional disabled state
    size?: 'small' | 'medium' | 'large'; // Optional size prop
}

const CustomButton: React.FC<CustomButtonProps> = ({
    customVariant = 'contained', // Default to contained button style
    sx,
    onClick,
    children,
    isLoading = false,
    isDisabled = false,
    size = 'small',
}) => {
    return (
        <Button
            onClick={onClick} // Pass onClick directly to the Button component
            variant={customVariant} // Set the variant dynamically (contained, text, or outlined)
            size={size} // Set the size dynamically (small, medium, or large)
            sx={{
                ...sx, // Allow additional custom styles via the sx prop
            }}
            disabled={isDisabled || isLoading} // Disable the button if it's in a loading state
        >
            {isLoading ? (
                <CircularProgress size={24} color='inherit' /> // Show loading spinner when loading
            ) : (
                children
            )}
        </Button>
    );
};

export default CustomButton;
