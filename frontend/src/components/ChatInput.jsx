import React, { useState } from "react";
import { Box, TextField, Button } from "@mui/material";

const ChatInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");

  // Handle input change
  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  // Handle message submission
  const handleSendMessage = () => {
    if (message.trim() !== "") {
      onSendMessage(message); // Pass the message to the parent component
      setMessage(""); // Clear input field after sending
    }
  };

  // Handle Enter key press for sending messages
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "0.5em", padding: "0.5em 0" }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Type a message..."
        value={message}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress} // Send on Enter press
      />
      <Button variant="contained" color="primary" onClick={handleSendMessage}>
        Send
      </Button>
    </Box>
  );
};

export default ChatInput;
