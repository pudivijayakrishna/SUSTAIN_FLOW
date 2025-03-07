import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useAuth } from "../context/auth";
import config from "../config.js";

const History = () => {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();
  const { LogOut } = useAuth();

  const theme = createTheme({
    typography: {
      fontFamily: "Quicksand",
      body1: {
        fontWeight: "600",
      },
    },
  });

  const getAuthToken = () => {
    const token = window.localStorage.getItem("token");
    
    if (!token) {
        LogOut();
        navigate("/login");
        return null;
    }

    try {
        const cleanToken = token.replace(/^"|"$/g, '');
        return `Bearer ${cleanToken}`;
    } catch (error) {
        console.error("Token error:", error);
        LogOut();
        navigate("/login");
        return null;
    }
  };

  const fetchHistory = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const headers = {
        "Content-Type": "application/json",
        "Authorization": token
      };

      const response = await axios.get(
        `${config.BACKEND_API || "http://localhost:8000"}/history`,
        { headers }
      );

      if (response.data && response.data.history) {
        const userHistory = response.data.history.filter(item => 
          item.receiver === localStorage.getItem('username') || 
          item.sender === localStorage.getItem('username')
        );
        setHistory(userHistory);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        LogOut();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [LogOut, navigate]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <div style={{ padding: "2em" }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", mb: 4 }}>
          My Reward History
        </Typography>

        {loading ? (
          <div style={{ textAlign: "center", padding: "2em" }}>
            <CircularProgress />
          </div>
        ) : history.length === 0 ? (
          <Typography variant="h6" style={{ textAlign: "center" }}>
            No reward history found. Start redeeming rewards to see your history!
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {history.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={`history-${item._id || index}`}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      boxShadow: 6,
                    }
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {item.reward.name}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      Date: {formatDate(item.createdAt)}
                    </Typography>
                    <Typography variant="body2" component="p" sx={{ 
                      color: item.type === 'earn' ? 'success.main' : 'error.main',
                      fontWeight: 'bold'
                    }}>
                      {item.type === 'earn' ? '+' : '-'}{item.reward.point} Points
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {item.type === 'earn' ? 'Earned from' : 'Redeemed with'}: {item.sender}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </div>
    </ThemeProvider>
  );
};

export default History;
