// src/components/ProtectedRoute.tsx

// Dependencies
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

interface ProtectedRouteProps {
    children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { token } = useSelector((state: RootState) => state.auth);
    return token == null ? <Navigate to={'/login'} /> : children;
};

export default ProtectedRoute;
