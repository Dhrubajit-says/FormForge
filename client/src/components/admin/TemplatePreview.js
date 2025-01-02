const TemplatePreview = ({ template, onClose }) => {
  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {template.title}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {template.questions.map((question, qIndex) => (
          <Box 
            key={qIndex}
            sx={{ 
              mb: 3,
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1
            }}
          >
            <Typography variant="h6" gutterBottom>
              Question {qIndex + 1} ({question.marks} marks)
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 2 }}>
              {question.text}
            </Typography>

            {question.questionType !== 'text' && (
              <Box sx={{ pl: 2 }}>
                {question.options.map((option, oIndex) => (
                  <Typography
                    key={oIndex}
                    variant="body1"
                    sx={{
                      mb: 1,
                      color: 'text.primary', // Always use normal text color
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    {question.questionType === 'single' ? (
                      <Radio
                        checked={question.correctOption === oIndex}
                        disabled
                        size="small"
                      />
                    ) : (
                      <Checkbox
                        checked={question.correctOptions?.includes(oIndex)}
                        disabled
                        size="small"
                      />
                    )}
                    {option}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        ))}
      </DialogContent>
    </Dialog>
  );
};

export default TemplatePreview; 