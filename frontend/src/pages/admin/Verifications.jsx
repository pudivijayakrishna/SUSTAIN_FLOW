import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    Chip,
    CircularProgress,
    Alert,
    Divider,
    IconButton,
    Tooltip,
    Paper,
    Tabs,
    Tab
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DescriptionIcon from '@mui/icons-material/Description';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import config from '../../config';
import AdminLayout from '../../components/admin/AdminLayout';

const pdfjsVersion = '3.11.174';
const pdfjsWorkerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;

const Verifications = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [pendingVerifications, setPendingVerifications] = useState([]);
    const [rejectedVerifications, setRejectedVerifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [verificationDialog, setVerificationDialog] = useState(false);
    const [comments, setComments] = useState('');
    const [documentLoading, setDocumentLoading] = useState(false);
    const [error, setError] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [selectedForDelete, setSelectedForDelete] = useState(null);
    const [documentUrl, setDocumentUrl] = useState(null);
    const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const fetchVerifications = async () => {
        try {
            const adminToken = localStorage.getItem('adminToken');
            if (!adminToken) {
                setError('Admin authentication required');
                return;
            }

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            };

            console.log('Fetching verifications...');
            const [pendingRes, rejectedRes] = await Promise.all([
                axios.get(
                    `${config.BACKEND_API}/admin/verifications/pending`,
                    { headers }
                ),
                axios.get(
                    `${config.BACKEND_API}/admin/verifications/rejected`,
                    { headers }
                )
            ]);

            console.log('Pending response:', pendingRes.data);
            console.log('Rejected response:', rejectedRes.data);

            // Update to handle the correct response structure
            const pendingData = pendingRes.data.pendingVerifications || [];
            const rejectedData = rejectedRes.data.rejectedVerifications || [];

            console.log('Processed pending data:', pendingData);
            console.log('Processed rejected data:', rejectedData);

            setPendingVerifications(pendingData);
            setRejectedVerifications(rejectedData);
        } catch (error) {
            console.error('Error fetching verifications:', error);
            if (error.response?.status === 401) {
                setError('Admin session expired. Please login again.');
            } else {
                setError('Failed to fetch verifications');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVerifications();
    }, []);

    const handleVerification = async (status) => {
        if (!comments.trim() && status === 'rejected') {
            enqueueSnackbar('Please provide rejection reason', { variant: 'error' });
            return;
        }

        try {
            const adminToken = localStorage.getItem('adminToken');
            if (!adminToken) {
                enqueueSnackbar('Admin authentication required', { variant: 'error' });
                return;
            }

            const response = await axios.post(
                `${config.BACKEND_API}/admin/verify-document`,
                {
                    userId: selectedUser._id,
                    status,
                    comments: comments.trim()
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${adminToken}`
                    }
                }
            );

            if (response.data.success) {
                enqueueSnackbar(
                    `Document ${status === 'approved' ? 'approved' : 'rejected'} successfully. Note: Email notification may be delayed.`, 
                    { variant: 'success' }
                );
                
                setVerificationDialog(false);
                setComments('');
                setSelectedUser(null);
                fetchVerifications();
            } else {
                throw new Error(response.data.error || 'Failed to update verification status');
            }
        } catch (error) {
            console.error('Error updating verification:', error);
            const errorMessage = error.response?.data?.error || 'Failed to update verification status';
            
            // Show a more user-friendly error message
            enqueueSnackbar(
                `${errorMessage}. The status was updated but email notification may have failed.`, 
                { variant: 'warning' }
            );
            
            // Still close the dialog and refresh the list since the status might have been updated
            setVerificationDialog(false);
            setComments('');
            setSelectedUser(null);
            fetchVerifications();
        }
    };

    const getStatusChip = (status, attempts) => {
        let color = 'default';
        let label = status;

        switch (status) {
            case 'pending':
                color = 'warning';
                label = `Pending (Attempt ${attempts}/2)`;
                break;
            case 'approved':
                color = 'success';
                break;
            case 'rejected':
                color = 'error';
                break;
            default:
                break;
        }

        return <Chip label={label} color={color} size="small" />;
    };

    const handlePreviewDocument = async (user) => {
        try {
            if (!user._id) {
                enqueueSnackbar('Invalid user data', { variant: 'error' });
                return;
            }

            setDocumentLoading(true);
            
            const response = await axios.post(
                `${config.BACKEND_API}/admin/decrypt-document`,
                { 
                    userId: user._id,
                    isHistorical: user.verificationStatus === 'rejected',
                    historyIndex: user.documentHistory?.length - 1
                },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data?.success && response.data?.data) {
                const newWindow = window.open('', '_blank');
                if (newWindow) {
                    newWindow.document.write(`
                        <iframe 
                            src="${response.data.data}" 
                            style="width:100%;height:100vh;border:none;"
                            title="Document Preview"
                        ></iframe>
                    `);
                    newWindow.document.title = response.data.fileName || 'Document Preview';
                    newWindow.focus();
                }
            } else {
                throw new Error('Invalid response data');
            }

        } catch (error) {
            console.error('Error previewing document:', error);
            enqueueSnackbar(error.response?.data?.error || 'Error loading document preview', 
                { variant: 'error' });
        } finally {
            setDocumentLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setLoading(true);
            console.log('Deleting verification for user:', selectedForDelete._id);

            await axios.delete(
                `${config.BACKEND_API}/admin/verifications/${selectedForDelete._id}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                    }
                }
            );

            enqueueSnackbar('Verification request deleted successfully', { 
                variant: 'success' 
            });
            
            setDeleteDialog(false);
            setSelectedForDelete(null);
            fetchVerifications();
        } catch (error) {
            console.error('Error deleting verification:', error);
            enqueueSnackbar(
                error.response?.data?.error || 'Failed to delete verification', 
                { variant: 'error' }
            );
        } finally {
            setLoading(false);
        }
    };

    const VerificationCard = ({ user, isRejected }) => {
        console.log('Rendering verification card for user:', user);
        return (
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        {user.name || user.username || 'Unknown User'}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                        Role: {user.role === 'ngo' ? 'NGO' : 'Compost Agency'}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                        Email: {user.email}
                    </Typography>
                    <Box mt={1} mb={2}>
                        {getStatusChip(user.verificationStatus || 'pending', user.submissionAttempts || 1)}
                    </Box>

                    {user.verificationDocument && (
                        <Typography color="textSecondary" gutterBottom>
                            Document: {user.verificationDocument.fileName || 'Uploaded document'}
                        </Typography>
                    )}

                    <Box display="flex" gap={1} mb={2}>
                        <Button
                            variant="outlined"
                            startIcon={<PreviewIcon />}
                            onClick={() => handlePreviewDocument(user)}
                            disabled={documentLoading || !user.verificationDocument}
                        >
                            View Document
                        </Button>
                    </Box>

                    <Box display="flex" justifyContent="flex-end" gap={1}>
                        {!isRejected ? (
                            <>
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<CheckCircleIcon />}
                                    onClick={() => {
                                        setSelectedUser(user);
                                        setVerificationDialog(true);
                                    }}
                                >
                                    Approve
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error"
                                    startIcon={<CancelIcon />}
                                    onClick={() => {
                                        setSelectedUser(user);
                                        setVerificationDialog(true);
                                    }}
                                >
                                    Reject
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => {
                                    setSelectedForDelete(user);
                                    setDeleteDialog(true);
                                }}
                            >
                                Delete
                            </Button>
                        )}
                    </Box>
                </CardContent>
            </Card>
        );
    };

    if (loading) {
        return (
            <AdminLayout>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                    <CircularProgress />
                </Box>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Box p={3}>
                <Typography variant="h4" gutterBottom>
                    Document Verifications
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Paper sx={{ mb: 2 }}>
                    <Tabs
                        value={activeTab}
                        onChange={(e, newValue) => setActiveTab(newValue)}
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                    >
                        <Tab 
                            icon={<FiberNewIcon />} 
                            iconPosition="start"
                            label={`NEW REQUESTS (${pendingVerifications.length})`} 
                        />
                        <Tab 
                            icon={<HistoryIcon />}
                            iconPosition="start"
                            label={`REJECTED REQUESTS (${rejectedVerifications.length})`}
                        />
                    </Tabs>
                </Paper>

                {activeTab === 0 ? (
                    pendingVerifications.length === 0 ? (
                        <Alert severity="info">No pending verifications</Alert>
                    ) : (
                        <Grid container spacing={3}>
                            {pendingVerifications.map((user) => (
                                <Grid item xs={12} md={6} key={user._id}>
                                    <VerificationCard user={user} isRejected={false} />
                                </Grid>
                            ))}
                        </Grid>
                    )
                ) : (
                    rejectedVerifications.length === 0 ? (
                        <Alert severity="info">No rejected verifications</Alert>
                    ) : (
                        <Grid container spacing={3}>
                            {rejectedVerifications.map((user) => (
                                <Grid item xs={12} md={6} key={user._id}>
                                    <VerificationCard user={user} isRejected={true} />
                                </Grid>
                            ))}
                        </Grid>
                    )
                )}

                {/* Document Preview Dialog */}
                <Dialog
                    open={documentDialogOpen}
                    onClose={() => {
                        setDocumentDialogOpen(false);
                        if (documentUrl) {
                            URL.revokeObjectURL(documentUrl);
                            setDocumentUrl(null);
                        }
                    }}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>Document Preview</DialogTitle>
                    <DialogContent>
                        {documentUrl && (
                            <iframe
                                src={documentUrl}
                                style={{
                                    width: '100%',
                                    height: '80vh',
                                    border: 'none'
                                }}
                                title="Document Preview"
                            />
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button 
                            onClick={() => {
                                setDocumentDialogOpen(false);
                                if (documentUrl) {
                                    URL.revokeObjectURL(documentUrl);
                                    setDocumentUrl(null);
                                }
                            }}
                        >
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Verification Dialog */}
                <Dialog 
                    open={verificationDialog} 
                    onClose={() => {
                        setVerificationDialog(false);
                        setComments('');
                    }}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>
                        Verify Document
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Comments"
                            fullWidth
                            multiline
                            rows={4}
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            required
                            helperText="Please provide comments for approval/rejection"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setVerificationDialog(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={() => handleVerification('rejected')} 
                            color="error"
                            variant="contained"
                        >
                            Reject
                        </Button>
                        <Button 
                            onClick={() => handleVerification('approved')} 
                            color="success"
                            variant="contained"
                        >
                            Approve
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Add delete confirmation dialog */}
                <Dialog
                    open={deleteDialog}
                    onClose={() => {
                        setDeleteDialog(false);
                        setSelectedForDelete(null);
                    }}
                >
                    <DialogTitle>Confirm Delete</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to delete this verification request?
                            This action cannot be undone.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialog(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleDelete}
                            color="error"
                            variant="contained"
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </AdminLayout>
    );
};

export default Verifications;