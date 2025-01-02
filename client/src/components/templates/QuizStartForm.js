import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box
} from '@mui/material';

const QuizStartForm = ({ open, onClose, onStart }) => {
  const [studentDetails, setStudentDetails] = useState({
    name: '',
    studentId: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onStart(studentDetails);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Enter Your Details</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ width: 400 }}>
            <TextField
              fullWidth
              required
              label="Full Name"
              value={studentDetails.name}
              onChange={(e) => setStudentDetails(prev => ({ ...prev, name: e.target.value }))}
              margin="normal"
            />
            <TextField
              fullWidth
              required
              label="Student ID"
              value={studentDetails.studentId}
              onChange={(e) => setStudentDetails(prev => ({ ...prev, studentId: e.target.value }))}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained"
            disabled={!studentDetails.name || !studentDetails.studentId}
          >
            Start Quiz
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default QuizStartForm; 