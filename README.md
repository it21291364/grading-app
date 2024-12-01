# GENAI – Based Auto graders for Assignment Evaluation (Technical based subjects)

This application is a full-stack solution that automates the grading of student answers using OpenAI's GPT-3.5 language model. Teachers can upload marking guides and student answer sheets, and the application will grade the answers based on the expected answers and instructions provided. It also allows for manual review and adjustment of marks before downloading the final results.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Application Workflow](#application-workflow)
- [Testing](#testing)
- [Deployment](#deployment)
- [Notes](#notes)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Features

- **Automated Grading**: Uses OpenAI's GPT-3.5 to grade student answers based on provided marking guides.
- **Manual Review**: Allows teachers to review and adjust marks and feedback before finalizing results.
- **Detailed Feedback**: Generates feedback for each student answer.
- **Result Download**: Provides options to download results in Excel, CSV, or PDF formats, including module details and question-wise marks.
- **User-Friendly Interface**: Easy-to-use frontend built with React and Material-UI.

## Prerequisites

- **Node.js**: Version 14.x or higher.
- **MongoDB**: Local or remote MongoDB instance.
- **OpenAI API Key**: A valid API key from OpenAI.
- **Git**: For cloning the repository.

## System Diagram

![System Diagram](https://drive.google.com/file/d/1UKjCZfsTCKLea5hoPyWBsy9pcI8FufAY/view?usp=drive_link)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/it21291364/grading-app.git
cd grading-app
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../client
npm install
```

## Configuration

### Backend Configuration

1. **Create a `.env` File in the `backend` Directory**

   ```bash
   cd ../backend
   touch .env
   ```

2. **Add the Following Environment Variables**

   ```env
   OPENAI_API_KEY=your_openai_api_key
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   ```

   - Replace `your_openai_api_key` with your actual OpenAI API key.
   - Replace `your_mongodb_connection_string` with your MongoDB URI.

3. **Ensure Environment Variables Are Loaded**

   The backend uses `dotenv` to load environment variables. This is configured at the top of `server.js`:

   ```javascript
   require('dotenv').config();
   ```

### Frontend Configuration

1. **Update API Base URLs if Necessary**

   If your backend is running on a different host or port, update the API URLs in the frontend code (usually in `axios` requests).

## Running the Application

### 1. Start the Backend Server

```bash
cd backend
npm start
```

- The backend server will start on `http://localhost:5000` by default.

### 2. Start the Frontend Application

Open a new terminal window:

```bash
cd frontend
npm start
```

- The frontend application will start on `http://localhost:3000`.

## Application Workflow

1. **Upload Marking Guide and Student Answers**

   - Navigate to `http://localhost:3000`.
   - Fill out the module details:
     - Module Name
     - Module Code
     - Batch (Regular or June)
     - Academic Year (1 to 4)
     - Semester (1 or 2)
   - Upload the Marking Guide and Student Answer Sheet (Excel files).

2. **Grading Process**

   - Upon submission, the application uploads the files to the backend.
   - The backend parses the files and stores the data in MongoDB.
   - The frontend navigates to a loading page while grading is in progress.
   - The backend uses OpenAI's API to grade each student's answers, considering:
     - The expected answer.
     - Instructions provided in the marking guide.
     - Ignoring spelling and grammar mistakes.
     - Awarding full marks for satisfactory answers.

3. **Review Results**

   - After grading, the frontend navigates to the review page.
   - Teachers can review each student's marks and feedback.
   - Adjust marks if necessary.
   - Submit to proceed to the next student.
   - After all students are reviewed, navigate to the download page.

4. **Download Results**

   - Choose the desired format (Excel, CSV, or PDF).
   - The downloaded file includes:
     - Module details (Module Name, Module Code, Academic Year, Semester, Batch).
     - Students' marks question-wise and total marks.

## Testing

- **Test Data**: Use sample marking guides and student answer sheets provided in the `samples` directory.
- **API Testing**: Use tools like Postman or curl to test backend endpoints.
- **Database Inspection**: Use MongoDB Compass or the MongoDB shell to inspect data.

## Deployment

- **Backend**: Deploy the backend server to a hosting service like Heroku, AWS, or DigitalOcean.
- **Frontend**: Deploy the frontend application to services like Netlify, Vercel, or GitHub Pages.
- **Environment Variables**: Ensure that environment variables are correctly set in the production environment.

## Notes

- **OpenAI API Usage and Costs**:
  - Be aware of the rate limits and costs associated with the OpenAI API.
  - Monitor usage to prevent unexpected charges.
  - Optimize prompts to reduce token usage if necessary.

- **Security**:
  - Do not expose your OpenAI API key in the frontend or in publicly accessible code.
  - Implement authentication and authorization if deploying to a production environment.

- **Data Privacy**:
  - Ensure that student data is handled securely and in compliance with relevant regulations.

- **Error Handling**:
  - The application includes error handling for API calls and data processing.
  - In case of errors, appropriate messages are logged, and users are informed.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **OpenAI**: For providing the GPT-3.5 language model and API.
- **Material-UI**: For the frontend UI components.
- **Contributors**: Rashen W.G.M. - IT21291364 - 24-25J-175

![University Logo](https://www.google.com/url?sa=i&url=https%3A%2F%2Fcommons.wikimedia.org%2Fwiki%2FFile%3ANew_Logo_of_SLIIT.png&psig=AOvVaw1CHP-BuMFcyN6lTWGqAzEh&ust=1733157157836000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCKCEndf_hooDFQAAAAAdAAAAABAI)