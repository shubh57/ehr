// src/components/AllRoutes.tsx

import React from 'react';
import { Route, Routes } from 'react-router-dom';
import UnderConstruction from '../pages/UnderConstruction';
import ConsultantPage from '../pages/ConsultantPage';
import PatientDetails from '../pages/PatientDetails';
import PatientProcedurePage from '../pages/PatientProcedurePage';

const AllRoutes = () => {
    return (
        <Routes>
            <Route path='/' element={<ConsultantPage />} />
            <Route path='/patient_details/:patient_id' element={<PatientDetails />} />
            <Route path='/patient_procedure/:patient_id' element={<PatientProcedurePage />} />
            <Route path='*' element={<UnderConstruction />} />
        </Routes>
    );
};

export default AllRoutes;
