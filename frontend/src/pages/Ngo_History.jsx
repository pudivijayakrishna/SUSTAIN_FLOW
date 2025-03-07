import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  TextField,
  MenuItem,
  Button,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useAuth } from "../context/auth";
import config from "../config.js";

const NgoHistory = () => {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  
  const [filterType, setFilterType] = useState("");
  const [filterMinPoints, setFilterMinPoints] = useState("");
  const [filterMaxPoints, setFilterMaxPoints] = useState("");
  
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
    return `Bearer ${token.replace(/^"|"$/g, '')}`;
  };

  const fetchHistory = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await axios.get(`${config.BACKEND_API}/ngo/history`, {
        headers: {
          Authorization: token,
        },
      });
      if (response.data && response.data.history) {
        setHistory(response.data.history.history);
        setFilteredHistory(response.data.history.history); // Initial display
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      if (error.response?.status === 401) {
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

  const handleFilter = () => {
    let filtered = history;

    if (filterType) {
      filtered = filtered.filter((item) => item.type === filterType);
    }

    if (filterMinPoints || filterMaxPoints) {
      filtered = filtered.filter((item) => {
        const points = item.reward.point;
        return (
          (!filterMinPoints || points >= filterMinPoints) &&
          (!filterMaxPoints || points <= filterMaxPoints)
        );
      });
    }

    setFilteredHistory(filtered);
  };

  const clearFilters = () => {
    setFilterType("");
    setFilterMinPoints("");
    setFilterMaxPoints("");
    setFilteredHistory(history);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <div style={{ padding: "2em" }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", mb: 4 }}>
          NGO Transaction History
        </Typography>

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Transaction Type"
              fullWidth
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="earn">Earn</MenuItem>
              <MenuItem value="redeem">Redeem</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Min Points"
              type="number"
              fullWidth
              value={filterMinPoints}
              onChange={(e) => setFilterMinPoints(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Max Points"
              type="number"
              fullWidth
              value={filterMaxPoints}
              onChange={(e) => setFilterMaxPoints(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sx={{ textAlign: "right" }}>
            <Button variant="contained" onClick={handleFilter} sx={{ mr: 2 }}>
              Apply Filters
            </Button>
            <Button variant="outlined" onClick={clearFilters}>
              Clear
            </Button>
          </Grid>
        </Grid>

        {loading ? (
          <div style={{ textAlign: "center", padding: "2em" }}>
            <CircularProgress />
          </div>
        ) : filteredHistory.length === 0 ? (
          <Typography variant="h6" style={{ textAlign: "center" }}>
            No transaction history available
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredHistory.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item._id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    "&:hover": {
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {item.reward.name}
                    </Typography>
                    <Typography color="textSecondary">
                      Date: {formatDate(item.createdAt)}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Points: {item.reward.point}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, fontWeight: "bold" }}>
                      Type: {item.type}
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

export default NgoHistory;
