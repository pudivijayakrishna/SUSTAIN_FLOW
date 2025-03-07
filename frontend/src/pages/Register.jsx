import * as React from "react";
import { useState } from "react";
import {
    Avatar,
    Button,
    CssBaseline,
    TextField,
    Typography,
    Container,
    Alert,
    Select,
    MenuItem,
    Box,
    FormControl,
    InputLabel,
    FormHelperText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Tooltip,
    IconButton,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import axios from "axios";
import config from "../config.js";

const defaultTheme = createTheme();

export default function Register() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        name: "",
        password: "",
        repassword: "",
        role: ""
    });
    const [loading, setLoading] = useState(false);
    const [validPassword, setValidPassword] = useState(false);
    const [isAlert, setIsAlert] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [documentError, setDocumentError] = useState("");
    const [showVerificationDialog, setShowVerificationDialog] = useState(false);
    const [showDocInfo, setShowDocInfo] = useState(false);
    const navigate = useNavigate();

    const isAgencyOrNGO = ['ngo', 'compostAgency'].includes(formData.role);

    const [formErrors, setFormErrors] = useState({
        username: false,
        email: false,
        name: false,
        password: false,
        repassword: false
    });
    const [errorMessages, setErrorMessages] = useState({
        username: '',
        email: '',
        name: '',
        password: '',
        repassword: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear errors when user types
        setFormErrors(prev => ({
            ...prev,
            [name]: false
        }));
        setErrorMessages(prev => ({
            ...prev,
            [name]: ''
        }));

        // Only validate password for donors
        if (name === 'password' && !isAgencyOrNGO) {
            const isValid = value.length >= 8;
            setValidPassword(isValid);
            setFormErrors(prev => ({
                ...prev,
                password: !isValid
            }));
            setErrorMessages(prev => ({
                ...prev,
                password: !isValid ? "Password must be at least 8 characters" : ""
            }));
        }

        // Validate confirm password
        if (name === 'repassword' && !isAgencyOrNGO) {
            const isValid = value === formData.password;
            setFormErrors(prev => ({
                ...prev,
                repassword: !isValid
            }));
            setErrorMessages(prev => ({
                ...prev,
                repassword: !isValid ? "Passwords do not match" : ""
            }));
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setDocumentError("");

        // Validate file count and type
        if (files.length === 0) {
            setDocumentError("Please select a verification document");
            return;
        }

        if (files.length > 1) {
            setDocumentError("Only one file can be uploaded");
            return;
        }

        const file = files[0];
        if (!file.type.includes('pdf')) {
            setDocumentError("Only PDF files are allowed");
            return;
        }

        if (file.size > 50 * 1024 * 1024) { // 50MB
            setDocumentError("File size should be less than 50MB");
            return;
        }

        setDocuments(files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.username || !formData.email || !formData.name || !formData.role) {
            return;
        }

        // Password validation only for donors
        if (!isAgencyOrNGO && (!validPassword || formData.password !== formData.repassword)) {
            return;
        }

        // Check if documents are required and provided
        if (isAgencyOrNGO && documents.length === 0) {
            setDocumentError("A valid verification document is required for NGO and Agency registration");
            return;
        }

        setLoading(true);
        try {
            // Prepare registration data
            const registrationData = new FormData();
            registrationData.append('username', formData.username);
            registrationData.append('email', formData.email);
            registrationData.append('name', formData.name);
            registrationData.append('role', formData.role);
            
            if (!isAgencyOrNGO) {
                registrationData.append('password', formData.password);
            }

            // Append verification document for NGO/Agency
            if (isAgencyOrNGO && documents.length > 0) {
                const file = documents[0];
                registrationData.append('verificationDocument', file);
            }

            const response = await axios.post(
                `${config.BACKEND_API}/auth/signup`,
                registrationData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.status === 201) {
                if (isAgencyOrNGO) {
                    setShowVerificationDialog(true);
                } else {
                    navigate("/login");
                }
            }
        } catch (error) {
            console.error("Registration error:", error);
            setIsAlert(true);
            if (error.response?.data?.message) {
                setDocumentError(error.response.data.message);
            } else {
                setDocumentError("Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const getDocumentRequirements = () => {
        if (formData.role === 'ngo') {
            return "Please upload any one of the following certificates:\n- 80G Certificate\n- 12A Certificate\n- CSR Certificate";
        } else if (formData.role === 'compostAgency') {
            return "Please upload EPR Certificate (Extended Producer Responsibility)";
        }
        return "";
    };

    return (
        <div className="my-glass-effect">
            <ThemeProvider theme={defaultTheme}>
                <Container component="main" maxWidth="sm">
                    <CssBaseline />
                    <Box sx={{
                        marginTop: 12,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        borderRadius: '2em',
                        padding: '3em',
                    }}>
                        <Avatar sx={{ m: 1 }} style={{ backgroundColor: "#25396F" }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Create A New Account
                        </Typography>
                        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Role</InputLabel>
                                <Select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <MenuItem value="compostAgency">Compost Agency</MenuItem>
                                    <MenuItem value="ngo">NGO</MenuItem>
                                    <MenuItem value="donor">Donor</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="username"
                                label="Username"
                                value={formData.username}
                                onChange={handleInputChange}
                                error={formErrors.username}
                                helperText={errorMessages.username}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="name"
                                label="Name"
                                value={formData.name}
                                onChange={handleInputChange}
                                error={formErrors.name}
                                helperText={errorMessages.name}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="email"
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                error={formErrors.email}
                                helperText={errorMessages.email}
                            />

                            {!isAgencyOrNGO && (
                                <>
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        name="password"
                                        label="Password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        error={formErrors.password}
                                        helperText={errorMessages.password}
                                    />
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        name="repassword"
                                        label="Confirm Password"
                                        type="password"
                                        value={formData.repassword}
                                        onChange={handleInputChange}
                                        error={formErrors.repassword}
                                        helperText={errorMessages.repassword}
                                    />
                                </>
                            )}

                            {isAgencyOrNGO && (
                                <>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1 }}>
                                        <Typography variant="body2">
                                            Please upload verification documents. Password will be provided after verification.
                                        </Typography>
                                        <Tooltip title="Click for more info">
                                            <IconButton 
                                                size="small" 
                                                onClick={() => setShowDocInfo(true)}
                                                sx={{ ml: 1 }}
                                            >
                                                <HelpOutlineIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                    <Button
                                        component="label"
                                        variant="outlined"
                                        startIcon={<CloudUploadIcon />}
                                        sx={{ mb: 2, width: '100%' }}
                                    >
                                        Upload Verification Documents
                                        <input
                                            type="file"
                                            hidden
                                            onChange={handleFileChange}
                                            accept="application/pdf"
                                        />
                                    </Button>
                                    {documents.length > 0 && (
                                        <Typography variant="body2" color="primary">
                                            {documents.length} file(s) selected
                                        </Typography>
                                    )}
                                    {documentError && (
                                        <Typography variant="body2" color="error">
                                            {documentError}
                                        </Typography>
                                    )}
                                </>
                            )}

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                disabled={loading}
                            >
                                {loading ? "Signing Up..." : "Sign Up"}
                            </Button>

                            {isAlert && (
                                <Alert severity="error">
                                    User Already Exists!
                                </Alert>
                            )}
                        </Box>
                    </Box>
                </Container>

                {/* Verification Dialog */}
                <Dialog
                    open={showVerificationDialog}
                    onClose={() => navigate("/login")}
                >
                    <DialogTitle>Registration Successful</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Your registration is pending verification. You will receive an email 
                            with your login credentials once your documents are verified by the admin.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => navigate("/login")}>
                            Okay
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Document Requirements Dialog */}
                <Dialog
                    open={showDocInfo}
                    onClose={() => setShowDocInfo(false)}
                    onClick={(e) => e.stopPropagation()}
                >
                    <DialogTitle>
                        Document Requirements
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText style={{ whiteSpace: 'pre-line' }}>
                            {getDocumentRequirements()}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowDocInfo(false)}>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </ThemeProvider>
        </div>
    );
}
