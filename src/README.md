# Mergington High School Activities API

A super simple FastAPI application that allows students to view and sign up for extracurricular activities.

## Features

- View all available extracurricular activities
- Sign up for activities

## Getting Started

1. Install the dependencies:

   ```
   pip install fastapi uvicorn
   ```

2. Run the application:

   ```
   python app.py
   ```

3. Open your browser and go to:
   - API documentation: http://localhost:8000/docs
   - Alternative documentation: http://localhost:8000/redoc

## API Endpoints

| Method | Endpoint                                                          | Description                                                         |
| ------ | ----------------------------------------------------------------- | ------------------------------------------------------------------- |
| GET    | `/activities`                                                     | Get all activities with their details and current participant count |
| POST   | `/activities/{activity_name}/signup?email=student@mergington.edu` | Sign up for an activity                                             |
| DELETE | `/activities/{activity_name}/signup?email=student@mergington.edu` | Unregister a student from an activity                               |

## Backend Tests

Backend API tests live in a separate top-level `tests/` directory and use `pytest`.

Run these commands from the repository root.

1. Install dependencies:

   ```
   pip install -r requirements.txt
   ```

2. Run all backend tests:

   ```
   pytest tests/ -v
   ```

3. Run focused mutation tests:

   ```
   pytest tests/ -k "signup or unregister" -v
   ```

### AAA Pattern

All tests follow the Arrange-Act-Assert structure with explicit section comments:

- `# Arrange`: setup, fixtures, and preconditions
- `# Act`: single primary API action
- `# Assert`: status code, payload, and side-effect checks

## Data Model

The application uses a simple data model with meaningful identifiers:

1. **Activities** - Uses activity name as identifier:

   - Description
   - Schedule
   - Maximum number of participants allowed
   - List of student emails who are signed up

2. **Students** - Uses email as identifier:
   - Name
   - Grade level

All data is stored in memory, which means data will be reset when the server restarts.
