import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    TextField
} from '@mui/material';
import axios from 'axios';
import config from '../../../config';  // Update path

// Rest of the code remains the same 