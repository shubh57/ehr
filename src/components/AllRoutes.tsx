// src/components/AllRoutes.tsx

import React from 'react';
import { Route, Routes } from 'react-router-dom';
import UnderConstruction from '../pages/UnderConstruction';
import ConsultantPage from '../pages/ConsultantPage';
import PatientDetails from '../pages/PatientDetails';

const AllRoutes = () => {
    return (
        <Routes>
            <Route path='/' element={<ConsultantPage />} />
            <Route path='/patient_details/:patient_id' element={<PatientDetails />} />
            <Route path='*' element={<UnderConstruction />} />
        </Routes>
    );
};

export default AllRoutes;
