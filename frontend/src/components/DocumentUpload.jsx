import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    Button
} from '@mui/material';

const DocumentUpload = ({ onFilesChange, maxFiles = 1 }) => {
    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles?.length > 0) {
            onFilesChange(acceptedFiles);
        }
    }, [onFilesChange]);

    const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
        onDrop,
        maxFiles,
        accept: {
            'application/pdf': ['.pdf']
        }
    });

    return (
        <Box>
            <Paper
                {...getRootProps()}
                sx={{
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: 'grey.100',
                    '&:hover': {
                        bgcolor: 'grey.200'
                    }
                }}
            >
                <input {...getInputProps()} />
                <Typography>
                    Drag & drop your document here, or click to select
                </Typography>
                <Typography variant="caption" display="block">
                    Only PDF files are accepted (Max size: 5MB)
                </Typography>
            </Paper>

            {acceptedFiles.length > 0 && (
                <List>
                    {acceptedFiles.map((file) => (
                        <ListItem key={file.path}>
                            <ListItemText 
                                primary={file.path}
                                secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                            />
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    );
};

export default DocumentUpload; 