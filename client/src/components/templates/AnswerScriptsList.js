import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  IconButton,
  Box,
  CircularProgress,
  Alert,
  Collapse,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Tooltip,
  Chip,
  Paper
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Delete as DeleteIcon,
  Assessment as AssessmentIcon,
  Search as SearchIcon,
  FiberNew as NewIcon
} from '@mui/icons-material';
import { templateAPI } from '../../services/api';
import AnswerScript from './AnswerScript';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

const AnswerScriptsList = () => {
  const [answerScripts, setAnswerScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedScript, setSelectedScript] = useState(null);
  const [showAnswerScript, setShowAnswerScript] = useState(false);
  const [openCards, setOpenCards] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showMarksDialog, setShowMarksDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [newSubmissions, setNewSubmissions] = useState(new Set());
  const theme = useTheme();

  const isNewSubmission = (submissionDate) => {
    const submissionTime = new Date(submissionDate).getTime();
    const currentTime = new Date().getTime();
    const hoursDifference = (currentTime - submissionTime) / (1000 * 60 * 60);
    return hoursDifference < 24;
  };

  useEffect(() => {
    const fetchAnswerScripts = async () => {
      try {
        setLoading(true);
        const response = await templateAPI.getAnswerScripts();
        
        // Fetch template data for each answer script
        const scriptsWithTemplates = await Promise.all(
          response.data.map(async (script) => {
            try {
              const templateResponse = await templateAPI.getTemplate(script.templateId);
              return {
                ...script,
                template: templateResponse.data
              };
            } catch (err) {
              console.error(`Error fetching template for script ${script._id}:`, err);
              return script;
            }
          })
        );

        setAnswerScripts(scriptsWithTemplates);
        
        // Track new submissions
        const newOnes = new Set(
          scriptsWithTemplates
            .filter(script => isNewSubmission(script.createdAt))
            .map(script => script._id)
        );
        setNewSubmissions(newOnes);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching answer scripts:', err);
        setError('Failed to fetch answer scripts');
        setLoading(false);
      }
    };
    fetchAnswerScripts();
  }, []);

  const handleViewScript = async (script) => {
    try {
      // Use the already fetched template data
      setSelectedScript({
        ...script,
        studentDetails: {
          name: script.studentName,
          studentId: script.studentId
        },
        template: script.template,
        userAnswers: script.answers.map(a => a.answer),
        score: script.score.toString()
      });
      setShowAnswerScript(true);
    } catch (err) {
      console.error('Error preparing script view:', err);
      setError('Failed to load answer script details');
    }
  };

  const toggleCard = (templateTitle) => {
    setOpenCards(prev => ({
      ...prev,
      [templateTitle]: !prev[templateTitle]
    }));
  };

  const handleScoreUpdate = (scriptId, newScore, textScores) => {
    setAnswerScripts(prev => {
      const updated = [...prev];
      const scriptIndex = updated.findIndex(script => script._id === scriptId);
      if (scriptIndex !== -1) {
        updated[scriptIndex] = {
          ...updated[scriptIndex],
          score: newScore,
          textScores: textScores
        };
      }
      return updated;
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatScore = (score, total, script) => {
    if (!score || !total) return 'N/A';
    
    // Check if there are unmarked text questions
    if (hasUnmarkedTextAnswers(script)) {
      return 'Pending Text Evaluation';
    }

    // Parse the score string properly
    let numerator, denominator;
    if (typeof score === 'string' && score.includes('/')) {
      [numerator, denominator] = score.split('/').map(Number);
    } else {
      numerator = Number(score);
      denominator = Number(total);
    }

    // Validate the numbers
    if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
      return 'Invalid Score';
    }

    return `${numerator}/${denominator}`;
  };

  const calculatePercentage = (score, total, script) => {
    if (!score || !total) return null;
    if (hasUnmarkedTextAnswers(script)) return null;

    // Parse the score string properly
    let numerator, denominator;
    if (typeof score === 'string' && score.includes('/')) {
      [numerator, denominator] = score.split('/').map(Number);
    } else {
      numerator = Number(score);
      denominator = Number(total);
    }

    // Validate the numbers
    if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
      return null;
    }

    const percentage = (numerator / denominator) * 100;
    return percentage.toFixed(0);
  };

  const handleDeleteClick = (script) => {
    setDeleteConfirm(script);
  };

  const handleDeleteConfirm = async () => {
    try {
      await templateAPI.deleteAnswerScript(deleteConfirm._id);
      
      // Update local state to remove the deleted script
      setAnswerScripts(prev => {
        const updated = [...prev];
        const index = updated.findIndex(script => script._id === deleteConfirm._id);
        if (index !== -1) {
          updated.splice(index, 1);
        }
        return updated;
      });
      
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting answer script:', err);
    }
  };

  const handleViewMarks = (templateTitle, scripts) => {
    setSelectedTemplate({
      title: templateTitle,
      scripts: scripts
    });
    setShowMarksDialog(true);
  };

  // Filter function for students
  const filterStudents = (scripts) => {
    if (!studentSearch) return scripts;
    
    return scripts.filter(script => 
      script.studentName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      script.studentId.toLowerCase().includes(studentSearch.toLowerCase())
    );
  };

  // Group scripts by template title
  const groupedScripts = answerScripts.reduce((acc, script) => {
    if (!acc[script.templateTitle]) {
      acc[script.templateTitle] = [];
    }
    acc[script.templateTitle].push(script);
    return acc;
  }, {});

  const hasUnmarkedTextAnswers = (script) => {
    if (!script?.template?.questions) return true; // Consider it unmarked if we don't have template data
    
    const hasTextQuestions = script.template.questions.some(q => q.questionType === 'text');
    if (!hasTextQuestions) return false;

    return script.template.questions.some((question, index) => {
      if (question.questionType === 'text') {
        const textScore = script.textScores?.[index];
        return textScore === undefined || textScore === null;
      }
      return false;
    });
  };

  const getSubmissionStatus = (script) => {
    const isNew = newSubmissions.has(script._id);
    const needsMarking = hasUnmarkedTextAnswers(script);
    
    if (isNew && needsMarking) {
      return {
        showIndicator: true,
        tooltipText: "New submission with unmarked text answers",
        color: "error"
      };
    } else if (isNew) {
      return {
        showIndicator: true,
        tooltipText: "New submission (less than 24h old)",
        color: "success"
      };
    }
    return { showIndicator: false };
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Container><Alert severity="error">{error}</Alert></Container>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Find your submissions here
      </Typography>
      
      <Grid container spacing={3}>
        {Object.entries(groupedScripts).map(([templateTitle, scripts]) => (
          <Grid item xs={12} md={6} key={templateTitle}>
            <Card>
              <CardHeader
                title={templateTitle}
                action={
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      onClick={() => handleViewMarks(templateTitle, scripts)}
                      size="small"
                    >
                      <AssessmentIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => toggleCard(templateTitle)}
                      size="small"
                    >
                      {openCards[templateTitle] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  </Box>
                }
              />
              <Collapse in={openCards[templateTitle]}>
                <CardContent>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Student</TableCell>
                          <TableCell>Score</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {scripts.map((script) => (
                          <TableRow 
                            key={script._id}
                            sx={{
                              bgcolor: newSubmissions.has(script._id) ? alpha('#4caf50', 0.05) : 'inherit',
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.05)
                              }
                            }}
                          >
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {script.studentName}
                                {getSubmissionStatus(script).showIndicator && (
                                  <Tooltip title={getSubmissionStatus(script).tooltipText}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Chip
                                        icon={<NewIcon />}
                                        label="New"
                                        size="small"
                                        color={getSubmissionStatus(script).color}
                                        sx={{
                                          height: '20px',
                                          '& .MuiChip-label': {
                                            px: 1,
                                            fontSize: '0.7rem'
                                          },
                                          '& .MuiChip-icon': {
                                            fontSize: '16px'
                                          }
                                        }}
                                      />
                                      {getSubmissionStatus(script).color === 'error' && (
                                        <Box
                                          sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            bgcolor: 'error.main',
                                            ml: 1
                                          }}
                                        />
                                      )}
                                    </Box>
                                  </Tooltip>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1,
                                color: hasUnmarkedTextAnswers(script) ? 'warning.main' : 'inherit'
                              }}>
                                {formatScore(script.score, script.totalQuestions, script)}
                                {calculatePercentage(script.score, script.totalQuestions, script) && (
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: 'text.secondary',
                                      fontSize: '0.75rem'
                                    }}
                                  >
                                    ({calculatePercentage(script.score, script.totalQuestions, script)}%)
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Tooltip title={formatDate(script.submittedAt || script.createdAt)}>
                                <span>
                                  {formatDate(script.submittedAt || script.createdAt)}
                                </span>
                              </Tooltip>
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <Tooltip title="View Answer Script">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleViewScript(script)}
                                    color="primary"
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Answer Script">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteClick(script)}
                                    color="error"
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Collapse>
            </Card>
          </Grid>
        ))}
      </Grid>

      {showAnswerScript && selectedScript && (
        <AnswerScript
          open={showAnswerScript}
          onClose={() => {
            setShowAnswerScript(false);
            setSelectedScript(null);
          }}
          quizData={selectedScript}
          onUpdateScore={handleScoreUpdate}
        />
      )}

      <Dialog
        open={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the answer script for{' '}
          <strong>{deleteConfirm?.studentName}</strong>?
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteConfirm(null)}
            color="primary"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showMarksDialog}
        onClose={() => setShowMarksDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">
                Marks: {selectedTemplate?.title}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => {
                  const filteredScripts = filterStudents(selectedTemplate?.scripts || []);
                  const csvContent = `data:text/csv;charset=utf-8,Student Name,ID,Score\n${
                    filteredScripts.map(script => 
                      `${script.studentName},${script.studentId},${script.score}`
                    ).join('\n')
                  }`;
                  
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement('a');
                  link.setAttribute('href', encodedUri);
                  link.setAttribute('download', `${selectedTemplate?.title}_marks.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                Export to CSV
              </Button>
            </Box>
            <TextField
              size="small"
              placeholder="Search by student name or ID..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              fullWidth
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Submission Date</TableCell>
                  <TableCell>Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filterStudents(selectedTemplate?.scripts || []).map((script) => (
                  <TableRow 
                    key={script._id}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      bgcolor: newSubmissions.has(script._id) ? alpha('#4caf50', 0.05) : 'inherit'
                    }}
                  >
                    <TableCell>{script.studentName}</TableCell>
                    <TableCell>{script.studentId}</TableCell>
                    <TableCell>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        color: hasUnmarkedTextAnswers(script) ? 'warning.main' : 'inherit'
                      }}>
                        {formatScore(script.score, script.totalQuestions, script)}
                        {calculatePercentage(script.score, script.totalQuestions, script) && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'text.secondary',
                              fontSize: '0.75rem'
                            }}
                          >
                            ({calculatePercentage(script.score, script.totalQuestions, script)}%)
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {formatDate(script.submittedAt || script.createdAt)}
                    </TableCell>
                    <TableCell>
                      {script.isDummy ? (
                        <Typography
                          component="span"
                          sx={{
                            px: 1,
                            py: 0.5,
                            bgcolor: 'grey.200',
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            color: 'text.secondary',
                            fontWeight: 'medium'
                          }}
                        >
                          PREVIEW
                        </Typography>
                      ) : 'Submission'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowMarksDialog(false);
            setStudentSearch(''); // Clear search when closing
          }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AnswerScriptsList; 