import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Inside your component
const navigate = useNavigate();

// Add this button somewhere in your dashboard
<Button
    variant="contained"
    color="primary"
    onClick={() => navigate('/donor/pickups')}
>
    View My Pickups
</Button> 