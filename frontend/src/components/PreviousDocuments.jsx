import React, { useState } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    CircularProgress,
    Chip,
    Alert,
    Button
} from '@mui/material';
import {
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineDot
} from '@mui/lab';
import PreviewIcon from '@mui/icons-material/Preview';
import axios from 'axios';
import config from '../config';

const PreviousDocuments = ({ documents, token }) => {
    const [loading, setLoading] = useState(false);
    const [activeDocId, setActiveDocId] = useState(null);

    const handlePreviewDocument = async (doc) => {
        try {
            if (!doc.documentId) {
                console.error('No document ID available:', doc);
                return;
            }

            setLoading(true);
            setActiveDocId(doc.documentId);

            console.log('Requesting document preview:', {
                documentId: doc.documentId,
                historyIndex: doc.historyIndex,
                hasToken: !!token
            });

            const response = await axios.post(
                `${config.BACKEND_API}/auth/preview-document/${doc.documentId}`,
                {
                    isHistorical: true,
                    historyIndex: doc.historyIndex,
                    token: token // Add token to request body
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data?.success && response.data?.data) {
                const dataUrl = response.data.data;
                
                if (!dataUrl.startsWith('data:')) {
                    throw new Error('Invalid data URL format');
                }
                
                const newWindow = window.open('', '_blank');
                if (newWindow) {
                    newWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                            <head>
                                <title>${doc.fileName || 'Document Preview'}</title>
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <style>
                                    body, html {
                                        margin: 0;
                                        padding: 0;
                                        height: 100vh;
                                        width: 100vw;
                                        overflow: hidden;
                                    }
                                    iframe {
                                        width: 100%;
                                        height: 100%;
                                        border: none;
                                    }
                                </style>
                            </head>
                            <body>
                                <iframe 
                                    src="${dataUrl}"
                                    type="${response.data.fileType || 'application/pdf'}"
                                    style="width:100%;height:100vh;border:none;"
                                ></iframe>
                            </body>
                        </html>
                    `);
                    newWindow.document.close();
                }
            }
        } catch (error) {
            console.error('Error previewing document:', error);
        } finally {
            setLoading(false);
            setActiveDocId(null);
        }
    };

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
                Document Submission History
            </Typography>
            <Timeline>
                {documents.map((doc, index) => (
                    <TimelineItem key={index}>
                        <TimelineSeparator>
                            <TimelineDot 
                                color={
                                    doc.status === 'approved' ? 'success' :
                                    doc.status === 'rejected' ? 'error' : 'primary'
                                }
                            />
                            <TimelineConnector />
                        </TimelineSeparator>
                        <TimelineContent>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle1">
                                    Submission {index + 1}
                                    <Chip
                                        label={doc.status}
                                        color={
                                            doc.status === 'approved' ? 'success' :
                                            doc.status === 'rejected' ? 'error' : 'primary'
                                        }
                                        size="small"
                                        sx={{ ml: 1 }}
                                    />
                                </Typography>
                                <Typography color="textSecondary">
                                    {new Date(doc.date).toLocaleDateString()}
                                </Typography>
                                {doc.comment && (
                                    <Alert 
                                        severity={doc.status === 'rejected' ? 'error' : 'info'}
                                        sx={{ mt: 1 }}
                                    >
                                        {doc.comment}
                                    </Alert>
                                )}
                                <Button
                                    startIcon={<PreviewIcon />}
                                    onClick={() => handlePreviewDocument(doc)}
                                    disabled={loading}
                                    sx={{ mt: 1 }}
                                >
                                    View Document
                                </Button>
                            </Box>
                        </TimelineContent>
                    </TimelineItem>
                ))}
            </Timeline>
        </Box>
    );
};

export default PreviousDocuments;