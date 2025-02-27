// src/pages/PrescriptionDocument.tsx

// Dependencies
import { ArrowBack } from '@mui/icons-material';
import React, { useEffect, useRef, useState } from 'react';
import { Patient } from '../../pages/ConsultantPage';
import { Document, Page, Text, View, StyleSheet, PDFViewer, PDFDownloadLink, Font } from '@react-pdf/renderer';
import { invoke } from '@tauri-apps/api/core';
import { useToast } from '@chakra-ui/react';
import { RefractionData } from './PatientRefraction';

// Define prescription PDF document
const PrescriptionDocument: React.FC<{ patient_id: number }> = ({ patient_id }) => {
    const toast = useToast();

    const [patientData, setPatientData] = useState<Patient>();
    const [isLoading, setIsLoading] = useState(false);

    const [refractionData, setRefractionData] = useState<any>(null);

    const fetchPatientData = async () => {
        try {
            setIsLoading(true);
            const data: Patient = await invoke('get_patient_data', { patientId: patient_id });
            setPatientData(data);
        } catch (error) {
            console.error('Error fetching patient data:', error);
            toast({
                title: `Error while fetching patient data: ${error}`,
                status: 'error',
                duration: 4000,
                isClosable: true,
                position: 'top',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRefractionData = async () => {
        try {
            setIsLoading(true);

            // Fetch Distance Vision data (Left)
            const leftDataDV: RefractionData = await invoke('get_refraction_data', {
                query: {
                    patient_id: patient_id,
                    side: 'LEFT',
                    value_type: 'UD',
                    vision_type: 'DV',
                },
            });

            // Fetch Near Vision data (Left)
            const leftDataNV: RefractionData = await invoke('get_refraction_data', {
                query: {
                    patient_id: patient_id,
                    side: 'LEFT',
                    value_type: 'UD',
                    vision_type: 'NV',
                },
            });

            // Fetch Distance Vision data (Right)
            const rightDataDV: RefractionData = await invoke('get_refraction_data', {
                query: {
                    patient_id: patient_id,
                    side: 'RIGHT',
                    value_type: 'UD',
                    vision_type: 'DV',
                },
            });

            // Fetch Near Vision data (Right)
            const rightDataNV: RefractionData = await invoke('get_refraction_data', {
                query: {
                    patient_id: patient_id,
                    side: 'RIGHT',
                    value_type: 'UD',
                    vision_type: 'NV',
                },
            });

            setRefractionData({
                LEFT: {
                    NV: leftDataNV,
                    DV: leftDataDV,
                },
                RIGHT: {
                    NV: rightDataNV,
                    DV: rightDataDV,
                },
            });
        } catch (error) {
            console.error('Error while fetching refraction data: ', error);
            toast({
                title: `Error while fetching refraction data: ${error}`,
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
        fetchPatientData();
        fetchRefractionData();
    }, []);

    const styles = StyleSheet.create({
        page: {
            padding: 30,
            backgroundColor: '#ffffff',
        },
        header: {
            fontSize: 24,
            marginBottom: 20,
            textAlign: 'center',
            fontWeight: 'bold',
        },
        patientInfoContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 20,
        },
        patientInfoLeft: {
            width: '60%',
        },
        patientInfoRight: {
            width: '30%',
            alignItems: 'flex-start',
        },
        patientInfoLabel: {
            fontSize: 14,
            fontWeight: 'bold',
        },
        patientInfoValue: {
            fontSize: 14,
            marginBottom: 5,
        },
        eyeLabels: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginBottom: 10,
            marginTop: 30,
        },
        eyeLabel: {
            fontSize: 24,
            fontWeight: 'bold',
        },
        table: {
            display: 'flex',
            width: 'auto',
            borderStyle: 'solid',
            borderWidth: 1,
            borderColor: '#000',
            marginBottom: 20,
        },
        tableRow: {
            flexDirection: 'row',
        },
        tableHeaderCell: {
            width: '12.5%',
            borderStyle: 'solid',
            borderWidth: 1,
            borderColor: '#000',
            padding: 5,
            backgroundColor: '#f0f0f0',
            fontWeight: 'bold',
            fontSize: 12,
            textAlign: 'center',
        },
        tableCell: {
            width: '12.5%',
            borderStyle: 'solid',
            borderWidth: 1,
            borderColor: '#000',
            padding: 5,
            fontSize: 12,
            textAlign: 'center',
        },
        leftCol: {
            width: '12.5%',
            borderStyle: 'solid',
            borderWidth: 1,
            borderColor: '#000',
            padding: 5,
            fontSize: 12,
            fontWeight: 'bold',
            textAlign: 'center',
        },
        additionalInfo: {
            marginTop: 5,
            marginBottom: 20,
            fontSize: 12,
        },
        lensType: {
            fontSize: 16,
            fontWeight: 'bold',
            marginTop: 10,
            marginBottom: 30,
        },
        signatures: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 40,
        },
        signatureBox: {
            width: '40%',
        },
        signatureName: {
            fontSize: 14,
            fontWeight: 'bold',
        },
        signatureTitle: {
            fontSize: 12,
        },
    });

    const calculateAge = (dob: string) => {
        const birthDate = new Date(dob);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            return age - 1;
        }
        return age;
    };

    return (
        <Document>
            <Page size='A4' style={styles.page}>
                <Text style={styles.header}>Glass Prescription</Text>

                <View style={styles.patientInfoContainer}>
                    <View style={styles.patientInfoLeft}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={styles.patientInfoLabel}>Patient: </Text>
                            <Text style={styles.patientInfoValue}>
                                {patientData?.first_name + ' ' + patientData?.last_name} ({patientData?.gender.slice(0, 1).toUpperCase()} /{' '}
                                {calculateAge(patientData?.date_of_birth || '')})
                            </Text>
                        </View>
                        <Text style={styles.patientInfoValue}>VARIKAPLAVILA VEEDU, KOOKKILIKKONAM P O</Text>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={styles.patientInfoLabel}>Mob: </Text>
                            <Text style={styles.patientInfoValue}>9400738957</Text>
                        </View>
                    </View>
                    <View style={styles.patientInfoRight}>
                        <View style={{ flexDirection: 'row', marginBottom: 5 }}>
                            <Text style={styles.patientInfoLabel}>Date: </Text>
                            <Text style={styles.patientInfoValue}>{new Date().toLocaleDateString('en-GB')}</Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={styles.patientInfoLabel}>MR No: </Text>
                            <Text style={styles.patientInfoValue}>{patientData?.mr_number || 'N/A'}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.eyeLabels}>
                    <Text style={styles.eyeLabel}>RE</Text>
                    <Text style={styles.eyeLabel}>LE</Text>
                </View>

                {refractionData && (
                    <View style={styles.table}>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableHeaderCell}></Text>
                            <Text style={styles.tableHeaderCell}>Sph</Text>
                            <Text style={styles.tableHeaderCell}>Cyl</Text>
                            <Text style={styles.tableHeaderCell}>Axis</Text>
                            <Text style={styles.tableHeaderCell}>V/A</Text>
                            <Text style={styles.tableHeaderCell}>Sph</Text>
                            <Text style={styles.tableHeaderCell}>Cyl</Text>
                            <Text style={styles.tableHeaderCell}>Axis</Text>
                            <Text style={styles.tableHeaderCell}>V/A</Text>
                        </View>

                        {/* Distance Vision Row */}
                        <View style={styles.tableRow}>
                            <Text style={styles.leftCol}>DV</Text>
                            <Text style={styles.tableCell}>{refractionData.RIGHT.DV.spherical}</Text>
                            <Text style={styles.tableCell}>{refractionData.RIGHT.DV.cylindrical}</Text>
                            <Text style={styles.tableCell}>{refractionData.RIGHT.DV.axis}</Text>
                            <Text style={styles.tableCell}>6/6 p</Text>
                            <Text style={styles.tableCell}>{refractionData.LEFT.DV.spherical}</Text>
                            <Text style={styles.tableCell}>{refractionData.LEFT.DV.cylindrical}</Text>
                            <Text style={styles.tableCell}>{refractionData.LEFT.DV.axis}</Text>
                            <Text style={styles.tableCell}>6/18 p</Text>
                        </View>

                        {/* Near Vision Row */}
                        <View style={styles.tableRow}>
                            <Text style={styles.leftCol}>NV</Text>
                            <Text style={styles.tableCell}>{refractionData.RIGHT.NV.spherical}</Text>
                            <Text style={styles.tableCell}>{refractionData.RIGHT.NV.cylindrical}</Text>
                            <Text style={styles.tableCell}>{refractionData.RIGHT.NV.axis}</Text>
                            <Text style={styles.tableCell}>6/6 p</Text>
                            <Text style={styles.tableCell}>{refractionData.LEFT.NV.spherical}</Text>
                            <Text style={styles.tableCell}>{refractionData.LEFT.NV.cylindrical}</Text>
                            <Text style={styles.tableCell}>{refractionData.LEFT.NV.axis}</Text>
                            <Text style={styles.tableCell}>N12</Text>
                        </View>
                    </View>
                )}

                <View style={styles.additionalInfo}>
                    <Text>IPD:</Text>
                </View>

                <Text style={styles.lensType}>Bifocal - Kryptok (temporary)</Text>

                <View style={styles.signatures}>
                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureName}>LEKSHMI</Text>
                        <Text style={styles.signatureTitle}>Optometrist</Text>
                    </View>
                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureName}>Dr. Shabna A</Text>
                        <Text style={styles.signatureTitle}>Consultant</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default PrescriptionDocument;
