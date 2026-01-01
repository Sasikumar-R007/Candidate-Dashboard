# JD Upload Procedure and Flow

## Issue Fixed
The JD file upload was failing with a 403 Forbidden error because:
1. The frontend was using a plain `fetch` call without the proper API base URL
2. The `apiRequest` helper function was setting `Content-Type: application/json` which doesn't work for FormData uploads

## Solution Implemented
1. Created a new `apiFileUpload` helper function in `client/src/lib/queryClient.ts` that:
   - Uses the proper API base URL (from `VITE_API_URL` environment variable)
   - Sends FormData without setting Content-Type header (browser sets it automatically with boundary)
   - Includes credentials for session authentication

2. Updated `client/src/pages/client-dashboard.tsx` to use `apiFileUpload` instead of plain `fetch`

## JD Upload Flow

### Step 1: Access JD Upload Section
1. Log in as a **Client** user
2. Navigate to the **Client Dashboard**
3. Find the **"JD Upload"** section in the dashboard

### Step 2: Upload JD File or Enter Text
You have two options:

**Option A: Upload JD File**
1. Click on the file upload area or drag & drop a file
2. Supported formats: `.pdf`, `.docx`, `.doc`
3. The file will be selected and ready for upload

**Option B: Enter JD Text**
1. Click "Enter JD Text" button
2. Paste or type the job description in the text area
3. Fill in additional details:
   - **Position**: Job title/position name
   - **Primary Skills**: Comma-separated list of required skills
   - **Secondary Skills**: Comma-separated list of nice-to-have skills
   - **Knowledge Only**: Skills that are knowledge-based only
   - **Special Instructions**: Any additional notes or requirements

### Step 3: Preview and Submit
1. Click **"Preview"** to review the JD details
2. In the preview modal, review all information
3. Click **"Submit"** to finalize the submission

## Backend Flow

### API Endpoints

1. **POST `/api/client/upload-jd-file`**
   - **Authentication**: Requires client authentication (`requireClientAuth` middleware)
   - **Input**: FormData with field name `jdFile`
   - **Process**:
     - Validates client session
     - Saves file to `uploads/` directory
     - Generates unique filename with timestamp
   - **Output**: Returns file URL and filename
   - **File Path**: `uploads/jdFile-{timestamp}-{random}.{ext}`

2. **POST `/api/client/submit-jd`**
   - **Authentication**: Requires client authentication
   - **Input**: JSON with:
     - `jdText`: Job description text (optional if file provided)
     - `jdFile`: URL of uploaded file (optional if text provided)
     - `position`: Job position/title
     - `primarySkills`: Comma-separated primary skills
     - `secondarySkills`: Comma-separated secondary skills
     - `knowledgeOnly`: Comma-separated knowledge-only skills
     - `specialInstructions`: Additional instructions
   - **Process**:
     - Validates client session and employee
     - Extracts company name from client profile
     - Generates Role ID in format `STR{YY}{NNN}` (e.g., STR25001)
     - Creates a new requirement in the database
     - Sets requirement status to 'open'
     - Stores JD details for later reference
   - **Output**: Returns success message and created requirement

### Database Flow

1. **File Storage**:
   - Files are saved to: `server/uploads/` directory
   - Filename format: `jdFile-{timestamp}-{random}.{ext}`
   - Accessible via: `http://{host}/uploads/{filename}`

2. **Requirement Creation**:
   - **Table**: `requirements`
   - **Role ID Format**: `STR{YY}{NNN}` where:
     - `STR` = prefix
     - `YY` = last 2 digits of current year
     - `NNN` = sequential number (001, 002, etc.)
   - **Status**: `open` (ready for assignment)
   - **Company**: Extracted from client's linked company
   - **SPOC**: Client's name or company SPOC
   - **Team Lead**: `null` (assigned later by admin)
   - **Talent Advisor**: `null` (assigned later by team lead)

3. **Requirement Lifecycle**:
   ```
   Client Submits JD
   ↓
   Requirement Created (Status: 'open')
   ↓
   Admin/Team Lead Assigns Team Lead
   ↓
   Team Lead Assigns Talent Advisor
   ↓
   Talent Advisor Works on Requirement
   ↓
   Requirement Status Updates (Active, Closed, etc.)
   ```

## Testing Procedure

### Prerequisites
1. Ensure you have a client user account
2. Client must be logged in with valid session
3. Server must be running on port 5000 (or configured port)
4. `uploads/` directory must exist (created automatically)

### Test Steps

1. **Login as Client**
   ```
   - Navigate to client login page
   - Enter client credentials
   - Verify session is established
   ```

2. **Upload JD File**
   ```
   - Go to Client Dashboard
   - Click on JD Upload section
   - Select a PDF/DOCX file
   - Verify file is selected (filename appears)
   ```

3. **Fill JD Details**
   ```
   - Enter Position: "Senior Software Engineer"
   - Enter Primary Skills: "React, Node.js, TypeScript"
   - Enter Secondary Skills: "AWS, Docker"
   - Enter Knowledge Only: "Agile methodologies"
   - Enter Special Instructions: "Remote work preferred"
   ```

4. **Submit JD**
   ```
   - Click "Preview" button
   - Review all details in preview modal
   - Click "Submit" button
   - Verify success toast message appears
   ```

5. **Verify Backend**
   ```
   - Check server logs for:
     * "JD file upload error" (should not appear)
     * "Submit JD error" (should not appear)
   - Check uploads/ directory for uploaded file
   - Check database requirements table for new entry
   ```

6. **Verify Requirement Created**
   ```
   - Check requirements list in Admin/Team Lead dashboard
   - Verify Role ID is in STR{YY}{NNN} format
   - Verify company name matches client's company
   - Verify status is 'open'
   ```

## Error Handling

### Common Errors and Solutions

1. **403 Forbidden**
   - **Cause**: Client not authenticated or session expired
   - **Solution**: Re-login as client user

2. **400 Bad Request - No file uploaded**
   - **Cause**: File not selected or FormData not properly constructed
   - **Solution**: Ensure file is selected before submitting

3. **500 Internal Server Error**
   - **Cause**: Server-side error (file system, database, etc.)
   - **Solution**: Check server logs for detailed error message

4. **File upload failed**
   - **Cause**: File too large (>5MB) or invalid file type
   - **Solution**: Use supported formats (.pdf, .docx, .doc) and ensure file < 5MB

## File Paths Reference

- **Frontend Upload Handler**: `client/src/pages/client-dashboard.tsx` (line ~1405)
- **Backend Upload Route**: `server/routes.ts` (line ~7677)
- **Backend Submit Route**: `server/routes.ts` (line ~7696)
- **File Upload Helper**: `client/src/lib/queryClient.ts` (apiFileUpload function)
- **Upload Directory**: `server/uploads/`
- **Authentication Middleware**: `server/routes.ts` (requireClientAuth function)

## Environment Variables

Ensure these are set:
- `VITE_API_URL`: Frontend API base URL (e.g., `http://localhost:5000` for dev)
- `NODE_ENV`: Environment mode (`development` or `production`)
- `BACKEND_URL`: Backend URL for production (used in file URL generation)

## Notes

- Files are stored permanently in the `uploads/` directory
- Role IDs are auto-generated and sequential per year
- Requirements created from JD submissions are initially unassigned
- JD details (text, file URL, skills) are stored with the requirement
- The requirement can be viewed and managed by Team Leads and Admins

