// src/components/AllRoutes.tsx

import React from 'react';
import { Route, Routes } from 'react-router-dom';
import UnderConstruction from '../pages/UnderConstruction';
import ConsultantPage from '../pages/ConsultantPage';
import PatientDetails from '../pages/PatientDetails';
import PatientProcedurePage from '../pages/PatientProcedurePage';
import PatientOptics from '../pages/PatientOptics';
import OpticsCanvasPage from '../pages/OpticsCanvasPage';
import LoginPage from '../pages/LoginPage';
import ProtectedRoute from './ProtectedRoute';
import SignupPage from '../pages/SignupPage';
import Dashboard from '../pages/Dashboard';

const AllRoutes = () => {
    return (
        <Routes>
            <Route path='/login' element={<LoginPage />} />
            <Route path='/signup' element={<SignupPage />} />

            <Route
                path='/'
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path='/patient_details/:patient_id'
                element={
                    <ProtectedRoute>
                        <PatientDetails />
                    </ProtectedRoute>
                }
            />

            <Route
                path='/patient_procedure/:patient_id'
                element={
                    <ProtectedRoute>
                        <PatientProcedurePage />
                    </ProtectedRoute>
                }
            />

            <Route
                path='/patient_optics/:patient_id'
                element={
                    <ProtectedRoute>
                        <PatientOptics />
                    </ProtectedRoute>
                }
            />

            <Route
                path='/optics_canvas/:patient_id'
                element={
                    <ProtectedRoute>
                        <OpticsCanvasPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path='*'
                element={
                    <ProtectedRoute>
                        <UnderConstruction />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};

export default AllRoutes;
