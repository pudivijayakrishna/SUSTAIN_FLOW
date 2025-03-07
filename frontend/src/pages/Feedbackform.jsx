import React, { useState } from "react";
import { TextField, Button, Typography, Grid, Box } from "@mui/material";
import axios from "axios";
import config from "../config";

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    feedback: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        `${config.BACKEND_API}/feedback`,
        formData
      );
      setMessage(response.data.message);
      setFormData({ name: "", email: "", feedback: "" });
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to submit feedback."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: "auto", padding: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
        Feedback Form
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Name"
              name="name"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Email"
              name="email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Feedback"
              name="feedback"
              fullWidth
              multiline
              rows={4}
              value={formData.feedback}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sx={{ textAlign: "center" }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ px: 5 }}
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </Grid>
        </Grid>
      </form>
      {message && (
        <Typography
          sx={{ mt: 3, textAlign: "center", color: "green", fontWeight: 600 }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default FeedbackForm;
