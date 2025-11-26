# AI Test Case Generator for Jira

**Accelerate your QA workflow by turning User Stories into comprehensive Test Cases instantly.**

This application acts as an intelligent QA Copilot, leveraging **Google Gemini AI** to analyze Jira User Stories and Acceptance Criteria. It automatically generates detailed positive and negative test scenarios, formatted perfectly for Jira, saving QA teams hours of manual documentation work.

## Key Features

*   **Smart Analysis**: Uses advanced LLMs to understand complex requirements and edge cases.
*   **Instant Generation**: Creates step-by-step test cases with preconditions and expected results in seconds.
*   **Seamless Jira Integration**:
    *   **Sub-task Creation**: Automatically attaches generated test cases as sub-tasks to your existing Jira Stories.
    *   **Smart Linking**: Links test cases directly to parent requirements.
*   **Interactive UI**:
    *   **Edit & Refine**: Manually tweak steps, titles, or results before saving.
    *   **Excel Export**: One-click copy to clipboard for spreadsheet documentation.
    *   **Manual Entry**: Add custom test cases alongside generated ones.
*   **Quality Assurance**: Ensures test coverage includes both "Happy Path" and "Error Handling" scenarios.

## Tech Stack

*   **Frontend**: React, TypeScript, Tailwind CSS
*   **Backend**: Python, FastAPI
*   **AI Model**: Google Gemini Pro
*   **Integration**: Jira REST API

## Setup & Installation

### Prerequisites
*   Node.js (v16+)
*   Python (v3.9+)
*   Jira Account (URL, Email, API Token)
*   Google Gemini API Key

### Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Create a virtual environment and activate it:
    ```bash
    python -m venv venv
    # Windows
    .\venv\Scripts\activate
    # Mac/Linux
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Create a `.env` file in the `backend` folder with your credentials:
    ```properties
    GOOGLE_API_KEY=your_key
    JIRA_URL=your_jira_url
    JIRA_EMAIL=your_email
    JIRA_API_TOKEN=your_token
    ```
5.  Run the server:
    ```bash
    uvicorn app.main:app --reload
    ```

### Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the application:
    ```bash
    npm start
    ```

## License

This project is licensed under the MIT License.
