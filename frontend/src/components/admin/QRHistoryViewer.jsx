import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Paper,
    Chip,
    IconButton,
    Tooltip,
    useTheme
} from '@mui/material';
import {
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
    TimelineOppositeContent
} from '@mui/lab';
import {
    QrCode as QrCodeIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    AccessTime as AccessTimeIcon,
    Person as PersonIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';

const QRHistoryViewer = ({ open, onClose, pickup }) => {
    const theme = useTheme();

    const handleDeleteQR = async (qrCodeId) => {
        try {
            await axios.delete(
                `${config.BACKEND_API}/api/admin/pickup/${pickup._id}/qr/${qrCodeId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            // Refresh pickup data if needed
        } catch (error) {
            console.error('Error deleting QR code:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return theme.palette.info.main;
            case 'used':
                return theme.palette.success.main;
            case 'expired':
                return theme.palette.error.main;
            default:
                return theme.palette.grey[500];
        }
    };

    const formatDateTime = (date) => {
        return new Date(date).toLocaleString();
    };

    const isExpired = (expiryDate) => {
        return new Date(expiryDate) < new Date();
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1
            }}>
                <QrCodeIcon color="primary" />
                QR Code History
            </DialogTitle>

            <DialogContent>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        <strong>Pickup Details:</strong>
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <Typography><strong>Donor:</strong> {pickup.donor}</Typography>
                        <Typography><strong>Agency:</strong> {pickup.receiver}</Typography>
                        <Typography>
                            <strong>Scheduled Date:</strong> {
                                pickup.confirmedDate ? 
                                formatDateTime(pickup.confirmedDate.date) : 
                                'Not confirmed'
                            }
                        </Typography>
                    </Paper>
                </Box>

                <Timeline>
                    {pickup.qrCodes.map((qr, index) => (
                        <TimelineItem key={qr._id}>
                            <TimelineOppositeContent color="text.secondary">
                                {formatDateTime(qr.generatedAt)}
                            </TimelineOppositeContent>

                            <TimelineSeparator>
                                <TimelineDot sx={{ bgcolor: getStatusColor(qr.status) }}>
                                    <QrCodeIcon />
                                </TimelineDot>
                                {index < pickup.qrCodes.length - 1 && <TimelineConnector />}
                            </TimelineSeparator>

                            <TimelineContent>
                                <Paper
                                    elevation={1}
                                    sx={{
                                        p: 2,
                                        bgcolor: 'background.default',
                                        position: 'relative'
                                    }}
                                >
                                    <Box sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start'
                                    }}>
                                        <Box>
                                            <Chip
                                                label={qr.status.toUpperCase()}
                                                size="small"
                                                color={
                                                    qr.status === 'used' ? 'success' :
                                                    qr.status === 'active' && !isExpired(qr.expiresAt) ? 'primary' :
                                                    'error'
                                                }
                                                sx={{ mb: 1 }}
                                            />
                                            
                                            <Typography variant="body2">
                                                <AccessTimeIcon 
                                                    fontSize="small" 
                                                    sx={{ 
                                                        verticalAlign: 'middle',
                                                        mr: 0.5,
                                                        color: 'action.active'
                                                    }}
                                                />
                                                Expires: {formatDateTime(qr.expiresAt)}
                                            </Typography>

                                            {qr.scannedBy && (
                                                <Typography variant="body2" sx={{ mt: 1 }}>
                                                    <PersonIcon 
                                                        fontSize="small"
                                                        sx={{ 
                                                            verticalAlign: 'middle',
                                                            mr: 0.5,
                                                            color: 'action.active'
                                                        }}
                                                    />
                                                    Scanned by: {qr.scannedBy}
                                                    {qr.scannedAt && ` at ${formatDateTime(qr.scannedAt)}`}
                                                </Typography>
                                            )}
                                        </Box>

                                        <Tooltip title="Delete QR Code">
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDeleteQR(qr._id)}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Paper>
                            </TimelineContent>
                        </TimelineItem>
                    ))}
                </Timeline>

                {pickup.qrCodes.length === 0 && (
                    <Box sx={{ 
                        textAlign: 'center', 
                        py: 4,
                        color: 'text.secondary'
                    }}>
                        <QrCodeIcon sx={{ fontSize: 40, mb: 2, opacity: 0.5 }} />
                        <Typography>No QR codes generated yet</Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default QRHistoryViewer; 