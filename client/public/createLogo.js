// You can use this script to generate PNG versions if needed
const canvas = document.createElement('canvas');
canvas.width = 192;
canvas.height = 192;
const ctx = canvas.getContext('2d');

// Background
ctx.fillStyle = '#1976d2';
ctx.fillRect(0, 0, 192, 192);

// Text
ctx.fillStyle = 'white';
ctx.font = 'bold 120px Poppins';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('F', 96, 96);

// Save as PNG
const dataUrl = canvas.toDataURL('image/png'); 