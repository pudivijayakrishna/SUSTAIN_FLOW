import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    TextField,
    InputAdornment,
    IconButton,
    Button,
    Rating,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip
} from '@mui/material';
import {
    Search as SearchIcon,
    Delete as DeleteIcon,
    Reply as ReplyIcon,
    FilterList as FilterIcon
} from '@mui/icons-material';
import { adminApi } from '../../services/adminApi';

const AdminFeedback = () => {
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        rating: 'all',
        status: 'all'  // 'all', 'replied', 'pending'
    });
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        try {
            setLoading(true);
            const response = await adminApi.getFeedback();
            setFeedback(response.feedback);
            setError(null);
        } catch (err) {
            setError('Failed to fetch feedback');
            console.error('Error fetching feedback:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async () => {
        try {
            await adminApi.replyToFeedback(selectedFeedback._id, replyText);
            await fetchFeedback();
            setSelectedFeedback(null);
            setReplyText('');
        } catch (err) {
            setError('Failed to send reply');
            console.error('Error replying to feedback:', err);
        }
    };

    const handleDelete = async (feedbackId) => {
        try {
            await adminApi.deleteFeedback(feedbackId);
            await fetchFeedback();
            setDeleteConfirm(null);
        } catch (err) {
            setError('Failed to delete feedback');
            console.error('Error deleting feedback:', err);
        }
    };

    const filteredFeedback = feedback.filter(item => {
        const matchesSearch = 
            item.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.message.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRating = 
            filters.rating === 'all' || 
            item.rating === parseInt(filters.rating);

        const matchesStatus = 
            filters.status === 'all' || 
            (filters.status === 'replied' ? item.reply : !item.reply);

        return matchesSearch && matchesRating && matchesStatus;
    });

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            {/* Search and Filters */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                    placeholder="Search feedback..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        )
                    }}
                    sx={{ flexGrow: 1 }}
                />

                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Rating</InputLabel>
                    <Select
                        value={filters.rating}
                        onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
                        label="Rating"
                    >
                        <MenuItem value="all">All</MenuItem>
                        {[1, 2, 3, 4, 5].map(rating => (
                            <MenuItem key={rating} value={rating}>
                                {rating} Stars
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        label="Status"
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="replied">Replied</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Feedback Grid */}
            <Grid container spacing={3}>
                {filteredFeedback.map((item) => (
                    <Grid item xs={12} md={6} lg={4} key={item._id}>
                        <Paper
                            elevation={2}
                            sx={{
                                p: 2,
                                position: 'relative',
                                borderLeft: '4px solid',
                                borderLeftColor: item.reply ? 'success.main' : 'warning.main',
                                '&:hover': { boxShadow: 3 }
                            }}
                        >
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </Typography>
                                <Rating value={item.rating} readOnly size="small" />
                            </Box>

                            <Typography variant="subtitle1" gutterBottom>
                                {item.user}
                            </Typography>

                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    mb: 2,
                                    minHeight: '60px',
                                    maxHeight: '100px',
                                    overflow: 'auto'
                                }}
                            >
                                {item.message}
                            </Typography>

                            {item.reply && (
                                <Box sx={{ 
                                    mt: 2, 
                                    p: 1, 
                                    bgcolor: 'action.hover',
                                    borderRadius: 1
                                }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Reply:
                                    </Typography>
                                    <Typography variant="body2">
                                        {item.reply}
                                    </Typography>
                                </Box>
                            )}

                            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                {!item.reply && (
                                    <Button
                                        size="small"
                                        startIcon={<ReplyIcon />}
                                        onClick={() => setSelectedFeedback(item)}
                                    >
                                        Reply
                                    </Button>
                                )}
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => setDeleteConfirm(item)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Reply Dialog */}
            <Dialog
                open={Boolean(selectedFeedback)}
                onClose={() => setSelectedFeedback(null)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Reply to Feedback</DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 2, mt: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Original Feedback:
                        </Typography>
                        <Typography>
                            {selectedFeedback?.message}
                        </Typography>
                    </Box>
                    <TextField
                        autoFocus
                        multiline
                        rows={4}
                        fullWidth
                        label="Your Reply"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedFeedback(null)}>Cancel</Button>
                    <Button 
                        variant="contained"
                        onClick={handleReply}
                        disabled={!replyText.trim()}
                    >
                        Send Reply
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog
                open={Boolean(deleteConfirm)}
                onClose={() => setDeleteConfirm(null)}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this feedback?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                    <Button 
                        color="error"
                        onClick={() => handleDelete(deleteConfirm._id)}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminFeedback; 