import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Container,
    Alert,
    Stepper,
    Step,
    StepLabel
} from '@mui/material';
import OTPVerification from '../components/OTPVerification';
import DocumentUpload from '../components/DocumentUpload';
import axios from 'axios';
import config from '../config';
import PreviousDocuments from '../components/PreviousDocuments';

const steps = ['Verify Email', 'Upload Document'];

const ResubmitDocument = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [userDetails, setUserDetails] = useState(null);
    const { token } = useParams();
    const navigate = useNavigate();
    const [previousDocuments, setPreviousDocuments] = useState([]);

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const response = await axios.get(
                    `${config.BACKEND_API}/auth/verify-resubmission/${token}`
                );
                setEmail(response.data.email);
                setUserDetails(response.data.user);
            } catch (error) {
                setError('Invalid or expired link');
            }
        };

        const fetchPreviousDocuments = async () => {
            try {
                const response = await axios.get(
                    `${config.BACKEND_API}/auth/document-history/${token}`
                );
                if (response.data.documents) {
                    // Add logging to see document structure
                    console.log('Documents from server:', response.data.documents);
                    
                    setPreviousDocuments(response.data.documents.map((doc, index) => ({
                        ...doc,
                        documentId: doc.id || doc._id, // Fix here: use either id or _id
                        historyIndex: index,  // Add index for historical reference
                        status: doc.status || 'pending',
                        date: new Date(doc.uploadedAt || doc.date).toISOString()
                    })));
                }
            } catch (error) {
                console.error('Error fetching previous documents:', error);
            }
        };

        if (token) {
            verifyToken();
            fetchPreviousDocuments();
        }
    }, [token]);

    const handleOTPVerification = async (otpValue) => {
        try {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('otp', otpValue);
            
            await axios.post(
                `${config.BACKEND_API}/auth/verify-otp`,
                { email, otp: otpValue },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            setActiveStep(1);
        } catch (error) {
            console.error('OTP verification error:', error);
            setError(error.response?.data?.error || 'Invalid OTP');
        }
    };

    const handleDocumentUpload = async (files) => {
        try {
            if (!files || files.length === 0) {
                setError('Please select a document to upload');
                return;
            }

            const file = files[0];
            console.log('File details:', {
                type: file.type,
                size: file.size,
                name: file.name
            });
            
            // Validate file type
            if (file.type !== 'application/pdf') {
                setError('Only PDF files are allowed');
                return;
            }

            // Validate file size (e.g., max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('File size should not exceed 5MB');
                return;
            }

            const formData = new FormData();
            formData.append('document', file);

            // Debug log
            console.log('Uploading document:', {
                token,
                fileName: file.name,
                fileSize: file.size
            });

            try {
                const response = await axios.post(
                    `${config.BACKEND_API}/auth/resubmit-document/${token}`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );

                console.log('Upload response:', response.data);

                if (response.data.success) {
                    navigate('/login', {
                        state: { 
                            message: 'Document submitted successfully. Please wait for admin verification.' 
                        }
                    });
                } else {
                    throw new Error(response.data.error || 'Failed to upload document');
                }
            } catch (error) {
                console.error('Upload error details:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message
                });
                throw error;  // Re-throw to be caught by outer catch
            }
        } catch (error) {
            console.error('Upload error:', error);
            setError(
                error.response?.data?.error || 
                error.message || 
                'Failed to upload document'
            );
        }
    };

    if (error) {
        return (
            <Container maxWidth="sm">
                <Alert severity="error" sx={{ mt: 4 }}>
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 4 }}>
                <Card>
                    <CardContent>
                        <Typography variant="h5" gutterBottom>
                            Document Resubmission
                        </Typography>

                        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>

                        {activeStep === 0 ? (
                            <OTPVerification 
                                email={email}
                                onVerificationComplete={handleOTPVerification}
                            />
                        ) : (
                            <Box>
                                {userDetails?.verificationComments && (
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Previous Rejection Reason:
                                        </Typography>
                                        <Alert severity="info">
                                            {userDetails.verificationComments[
                                                userDetails.verificationComments.length - 1
                                            ].comment}
                                        </Alert>
                                    </Box>
                                )}
                                <DocumentUpload 
                                    onFilesChange={handleDocumentUpload}
                                    maxFiles={1}
                                />
                            </Box>
                        )}
                        {previousDocuments.length > 0 && (
                            <PreviousDocuments 
                                documents={previousDocuments} 
                                token={token}
                            />
                        )}
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
};

export default ResubmitDocument;