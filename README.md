# Overview
- This file contains the README documentation for the Symptom Checker backend project.
 
- The Symptom Checker backend project is the server-side application which handles the ICD API authentication, access and data processing and generating relevant output for the symptoms passed down from the frontend API (`axios`).

- Prototype, plan and implementation of the Symptom Checker application are defined in the [prototype README](https://github.com/prak112/ICD11-SymptomChecker#oveview)
- Tools and Technologies used : 
    - `express`
    - `node`

## Workflow
<!-- TO DO: 
use alt, opt - https://mermaid.js.org/syntax/sequenceDiagram.html#alt
1. valid, invalid Signup
2. valid, invalid Login
3. valid, invalid symptoms
use links/drop menu - https://mermaid.js.org/syntax/sequenceDiagram.html#actor-menus
1. for Frontend, Backend repos key directories
2. for Database schema
3. for ICD11 API authentication controller
4. to seperate frontend and backend workflow by hyperlinking Workflow in README
use styling - https://mermaid.js.org/syntax/sequenceDiagram.html#styling
1. style header texts - CLIENT, SERVER
2. style components
3. style interactions (for visibility)
 -->
```mermaid
sequenceDiagram
    box Blue CLIENT
    participant UI
    participant FRONTEND
    end
    box Purple SERVER
    participant BACKEND
    participant ICD11 API
    participant DATABASE
    end

    UI->>+FRONTEND: User : opens application
    FRONTEND-->>-UI: ReactJS : renders <App />
    loop Scheduled Renewal of Auth Token every hour
        BACKEND->>+ICD11 API: Api Auth Middleware : controllers/auth/apiAuthController.js
        ICD11 API-->>-BACKEND: Auth Token : Bearer, 3600 seconds validity
    end
    UI->>+FRONTEND: Auth : User registers from <Sidebar />
    FRONTEND-->>-UI: React-Router : renders <Signup /> modal
    UI->>+FRONTEND: Auth: User inputs information
    FRONTEND->>+BACKEND: Auth : call registerUser in services/auth.js
    BACKEND->>+DATABASE: Auth : create user in 'user' collection
    DATABASE-->>-BACKEND: Auth: return non-critical user information
    BACKEND-->>-FRONTEND: Auth : showAlert state success
    FRONTEND-->>-UI: Auth : redirects to <Login /> modal
    UI->>+FRONTEND: Auth : User enters login credentials
    FRONTEND->>+BACKEND: Auth : call authenticateUser in services/auth.js
    BACKEND->>+DATABASE: Auth : verify User login credentials
    DATABASE-->>-BACKEND: Auth : User exists
    BACKEND-->>-FRONTEND: Auth : sessionStorage created, 'auth_token' packed in httpCookie
    FRONTEND-->>-UI: Auth : User-specific session created

    UI->>+FRONTEND: User : inputs symptoms in <SymptomForm />
    FRONTEND->>+BACKEND: Request : <SymptomForm /> via services/symptoms.js 
    BACKEND->>+DATABASE: Data Encryption : controllers/symptomChecker.js via models/symptom.js to MongoDB
    BACKEND->>+ICD11 API: Diagnose symptoms : controllers/symptomChecker.js
    ICD11 API-->>-BACKEND: Results from ICD : diagnosis with reference URIs
    BACKEND->>+ICD11 API: Lookup reference URIs : controllers/utils/lookupSearchData.js 
    ICD11 API-->>-BACKEND: Results from ICD : detailed info about each diagnosis
    BACKEND->>+DATABASE: Data Encryption : diagnosisData from controllers/symptomChecker.js via models/symptom.js to MongoDB
    BACKEND->>-FRONTEND: Response : returns diagnosisData to <SymptomForm />
    FRONTEND-->>-UI: <SymptomForm /> : renders <Diagnosis />

    UI->>+FRONTEND: Auth : User logs out from <Sidebar />
    FRONTEND-->>-UI: Auth : <Logout /> modal asks confirmation
    UI->>+FRONTEND: Auth : User confirms logout
    FRONTEND-->>-UI: Auth : sessionStorage cleared, user redirected to <App />
```

<hr>
<br>

# Usage
- Make sure you have `node`(v`20.11.0`) and `npm`(v`10.5.0`) installed on your machine before running these commands.

- Clone the project
```bash
    git clone https://github.com/prak112/Symptom-Checker-backend.git
```

- Install dependencies using `npm`
```bash
    cd Symptom-Checker-backend/symptom-checker-backend
    npm install
```

- Run the development server
```bash
    npm run dev
``` 