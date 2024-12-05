# kitameraki_recruitment_bagasPrabowo

This is a full-stack application for managing tasks. It includes a **backend** built with TypeScript and Express, and a **frontend** built with React, TypeScript, Fluent UI, and Tailwind CSS.

---

## Backend

### Scripts

- **`npm run start`**: Start the backend server.
- **`npm run dev`**: Start the backend server in development mode using `nodemon`.
- **`npm run test`**: Run tests with Jest.
- **`npm run coverage`**: Generate code coverage reports.

### Key Features

- API for managing tasks (CRUD operations).
- Input validation and error handling.
- Task model using TypeScript.

---

## Frontend

The frontend is located in the `src/frontend` directory.

### Scripts

- **`npm run dev`**: Start the development server.
- **`npm run build`**: Build the frontend for production.
- **`npm run lint`**: Run ESLint to check for code issues.
- **`npm run preview`**: Preview the production build.

### Key Features

- React components styled with Fluent UI and Tailwind CSS.
- State management using custom hooks and stores.
- API integration with Axios.

---

## Installation

### Backend

1. Navigate to the root directory:
   ```bash
   cd <backend-directory>
   ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Copy and fill the .env file:
    ```bash
    cp .env.example .env
    ```
4. Run the server:
    ```bash
    npm run dev
    ```

### Frontend
1. Navigate to the frontend directory:
    ```bash
    cd src/frontend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Copy and fill the .env file:
    ```bash
    cp .env.example .env
    ```
4. Run the server:
    ```bash
    npm run dev
    ```

### Testing
- Backend tests are located in src/tests. Run tests using:
    ```bash
    cd <backend-directory>
    npm run test
    ```

### API Documentation
- API documentation is provided using Swagger. View the API spec in swagger.json or serve it using tools like Swagger UI. The API documentation can be accessed at:

    ```bash
    <backend-url>/api-docs
    ```
    Replace <backend-url> with the URL where your backend is running (e.g., http://localhost:3000).
