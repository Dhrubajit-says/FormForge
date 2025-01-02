# FormForge

FormForge is a powerful web application for creating and managing educational assessments, including quizzes, tests, and questionnaires. Built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

- **Multiple Assessment Types**
  - Quizzes
  - Timed Tests
  - Questionnaires

- **Question Types Support**
  - Single Choice
  - Multiple Choice
  - Text Answers
  - Image Questions

- **Advanced Features**
  - Auto-save functionality
  - Timer for tests
  - Image upload support
  - Score calculation
  - Answer scripts management
  - Student response tracking

- **Admin Controls**
  - User management
  - Template management
  - Access control
  - User blocking capability

- **User Features**
  - Profile management
  - Password change
  - Dark/Light theme
  - Template sharing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. **Clone the repository**

git clone https://github.com/yourusername/form-forge.git
`cd form-forge`

**Install server dependencies**
`cd server
npm install`


3. **Install client dependencies**
`cd ../client
npm install`

*Configure environment variables**

Create a `.env` file in the server directory:
env:
`MONGODB_URI=mongodb://127.0.0.1:27017/quiz-template-app
JWT_SECRET=your_jwt_secret_key
PORT=5001`


## Running the Application

1. **Start the MongoDB server**
`mongod --config /path/to/mongod.conf`


2. **Start the backend server**
`cd server
npm start`


3. **Start the frontend application**
`cd client
npm start`


The application will be available at `http://localhost:3000`

## Project Structure


## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth` - Get user info
- `PUT /api/auth/change-password` - Change password

### Templates
- `GET /api/templates` - Get all templates
- `POST /api/templates` - Create template
- `GET /api/templates/:id` - Get single template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/block` - Toggle user block
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/templates/:id` - Get template (admin access)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Acknowledgments

- Material-UI for the component library
- Framer Motion for animations
- Redux Toolkit for state management
