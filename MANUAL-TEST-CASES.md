# 📋 Employee Manager - Manual Test Cases Guide

> **For Manual Testers, Business Users, and Non-Technical Team Members**

This comprehensive guide provides step-by-step instructions for manually testing the Employee Manager application. Each test case is designed to be easy to follow, regardless of your technical background.

---

## 🚀 Quick Setup Guide

### Prerequisites
1. **Application Running**: Ensure the Employee Manager application is running
   - Frontend: Should be accessible at `http://localhost:5173`
   - Backend: Should be running on `http://localhost:4000`

2. **Test Accounts Available**:
   - **Admin**: Username: `admin`, Password: `password`
   - **User**: Username: `user`, Password: `123456`
   - **Test**: Username: `test`, Password: `test123`

3. **Browser**: Use any modern web browser (Chrome, Firefox, Safari, Edge)

---

## 🔐 Authentication & Security Test Cases

### TEST CASE 1: Login Page Display
**Purpose**: Verify the login page appears correctly and is user-friendly
**Business Value**: Ensures first impression is professional and functional

**Steps**:
1. Open your web browser
2. Navigate to `http://localhost:5173`
3. **Verify** you see:
   - Page title contains "Employee Manager"
   - Username input field (clearly labeled)
   - Password input field (clearly labeled) 
   - Login button (clickable)
   - Professional appearance with company branding

**Expected Result**: ✅ Login page loads completely with all elements visible and functional

**What Could Go Wrong**: ❌ Missing fields, broken layout, slow loading

---

### TEST CASE 2: Successful Login (Admin User)
**Purpose**: Verify authorized users can access the system
**Business Value**: Ensures legitimate users can access employee data

**Steps**:
1. On the login page, enter:
   - Username: `admin`
   - Password: `password`
2. Click the "Login" button
3. **Verify** you are:
   - Redirected to the employee list page
   - Can see employee data table
   - See "Logout" button (top right)
   - No longer see "Login" button

**Expected Result**: ✅ Successfully logged in and viewing employee dashboard

**What Could Go Wrong**: ❌ Stuck on login page, error messages, no data visible

---

### TEST CASE 3: Multiple User Account Testing
**Purpose**: Verify all authorized user accounts work correctly
**Business Value**: Ensures all team members can access the system

**Steps**:
1. **Test Account 1 (Admin)**:
   - Username: `admin`, Password: `password`
   - Login → Verify access → Logout
2. **Test Account 2 (User)**:
   - Username: `user`, Password: `123456`
   - Login → Verify access → Logout
3. **Test Account 3 (Test)**:
   - Username: `test`, Password: `test123`
   - Login → Verify access → Logout

**Expected Result**: ✅ All three accounts successfully log in and access employee data

**What Could Go Wrong**: ❌ Any account fails to login or shows different data

---

### TEST CASE 4: Invalid Login Protection
**Purpose**: Verify unauthorized users cannot access the system
**Business Value**: Protects sensitive employee data from unauthorized access

**Steps**:
1. **Test Wrong Password**:
   - Username: `admin`, Password: `wrongpassword`
   - Click Login
   - **Verify**: Error message appears, stay on login page

2. **Test Wrong Username**:
   - Username: `invalid`, Password: `password`
   - Click Login
   - **Verify**: Error message appears, stay on login page

3. **Test Empty Fields**:
   - Leave both fields empty
   - Click Login
   - **Verify**: Validation message appears

**Expected Result**: ✅ All invalid attempts are rejected with clear error messages

**What Could Go Wrong**: ❌ Invalid credentials allow access, unclear error messages

---

### TEST CASE 5: Session Security 
**Purpose**: Verify users are properly logged out and cannot access data without login
**Business Value**: Prevents unauthorized access to employee information

**Steps**:
1. Login with valid credentials
2. Navigate to employee list page
3. Click "Logout" button
4. **Verify**:
   - Redirected to login page
   - Cannot access `/list` page directly by typing URL
   - Must login again to access employee data

**Expected Result**: ✅ Complete logout with protected pages requiring re-authentication

**What Could Go Wrong**: ❌ Can still access employee data after logout

---

## 👥 Employee Management Test Cases

### TEST CASE 6: Employee List Display
**Purpose**: Verify employee data is displayed clearly and completely
**Business Value**: Ensures HR staff can view all employee records efficiently

**Steps**:
1. Login with valid credentials
2. Navigate to employee list (should be automatic)
3. **Verify** the table shows:
   - Column headers: ID, Name, Email, Position, Actions
   - Employee data in organized rows
   - Each row has Edit and Delete buttons
   - Professional table formatting

**Expected Result**: ✅ Clean, organized employee data table with all information visible

**What Could Go Wrong**: ❌ Missing data, poor formatting, missing action buttons

---

### TEST CASE 7: Add New Employee (Complete Workflow)
**Purpose**: Verify HR can successfully add new employees to the system
**Business Value**: Essential for onboarding new team members

**Steps**:
1. Login and navigate to employee list
2. Click "Add Employee" button
3. **Fill out the form**:
   - Name: `John Smith`
   - Email: `john.smith@company.com`
   - Position: `Senior Developer`
4. Click "Save" or "Submit"
5. **Verify**:
   - Success message appears
   - Redirected back to employee list
   - New employee appears in the table
   - Employee count increased by 1

**Expected Result**: ✅ New employee successfully added and visible in the system

**What Could Go Wrong**: ❌ Form doesn't save, errors occur, data doesn't appear

---

### TEST CASE 8: Edit Existing Employee
**Purpose**: Verify HR can update employee information when changes occur
**Business Value**: Keeps employee records current and accurate

**Steps**:
1. Login and navigate to employee list  
2. Find any existing employee row
3. Click the "Edit" button for that employee
4. **Modify the information**:
   - Change the position to "Team Lead"
   - Update any other field
5. Save the changes
6. **Verify**:
   - Success message appears
   - Updated information shows in the employee list
   - Changes are preserved when page is refreshed

**Expected Result**: ✅ Employee information successfully updated and persisted

**What Could Go Wrong**: ❌ Changes don't save, old data still shows, errors occur

---

### TEST CASE 9: Delete Employee (With Confirmation)
**Purpose**: Verify employees can be safely removed from the system
**Business Value**: Maintains accurate records when employees leave

**Steps**:
1. Login and navigate to employee list
2. Note the total number of employees
3. Find any employee row
4. Click the "Delete" button
5. **Verify** confirmation dialog appears asking "Are you sure?"
6. Click "Yes" or "Confirm"
7. **Verify**:
   - Employee is removed from the list
   - Total employee count decreased by 1
   - Success message appears

**Expected Result**: ✅ Employee safely deleted with proper confirmation process

**What Could Go Wrong**: ❌ No confirmation dialog, employee not deleted, system errors

---

### TEST CASE 10: Employee Search Functionality
**Purpose**: Verify HR can quickly find specific employees
**Business Value**: Improves efficiency when working with large employee databases

**Steps**:
1. Login and navigate to employee list with multiple employees
2. **Test Search by Name**:
   - Type a partial employee name in search box
   - Verify only matching employees appear
3. **Test Search by Email**:
   - Clear previous search
   - Type part of an email address
   - Verify filtering works correctly
4. **Test Search by Position**:
   - Clear search
   - Type a job position
   - Verify filtering by position works
5. **Test Empty Search**:
   - Clear all search terms
   - Verify all employees reappear

**Expected Result**: ✅ Search filters work accurately for all fields

**What Could Go Wrong**: ❌ Search doesn't work, filters wrong employees, no results show

---

## 🎨 User Interface & Experience Test Cases

### TEST CASE 11: Theme Toggle (Light/Dark Mode)
**Purpose**: Verify users can customize their viewing preference
**Business Value**: Improves user comfort and accessibility

**Steps**:
1. Login to the application
2. **Identify Current Theme** (light or dark)
3. Look for theme toggle button (usually moon/sun icon)
4. Click the theme toggle
5. **Verify**:
   - Interface immediately changes color scheme
   - Text remains readable
   - All buttons and elements are visible
6. **Toggle Back**:
   - Click theme button again
   - Verify returns to original theme
7. **Test Persistence**:
   - Set to dark mode
   - Logout and login again
   - Verify dark mode is remembered

**Expected Result**: ✅ Theme changes work smoothly and preference is saved

**What Could Go Wrong**: ❌ Theme doesn't change, text becomes unreadable, preference not saved

---

### TEST CASE 12: Responsive Design (Mobile/Tablet Testing)
**Purpose**: Verify application works on different screen sizes
**Business Value**: Ensures accessibility on mobile devices for remote work

**Steps**:
1. **Desktop View** (Normal browser window):
   - Login and verify all elements visible
   - Navigate through all pages
2. **Tablet View** (Resize browser to ~768px width):
   - Reload page
   - Verify layout adapts appropriately
   - Test all functionality still works
3. **Mobile View** (Resize browser to ~375px width):
   - Reload page
   - Verify mobile-friendly layout
   - Test navigation menu (may become hamburger menu)
   - Verify all features accessible

**Expected Result**: ✅ Application works well on all screen sizes

**What Could Go Wrong**: ❌ Elements overlap, buttons too small, features not accessible

---

### TEST CASE 13: Navigation Flow Testing
**Purpose**: Verify users can easily move between different sections
**Business Value**: Ensures efficient workflow for daily tasks

**Steps**:
1. **Test Main Navigation**:
   - Login → Employee List
   - Employee List → Add Employee
   - Add Employee → Back to List
   - List → Edit Employee → Back to List
2. **Test Direct URL Access** (Advanced):
   - While logged in, try accessing `/list` directly
   - Verify page loads correctly
3. **Test Back Button**:
   - Navigate: List → Add → Use browser back button
   - Verify proper navigation behavior

**Expected Result**: ✅ Smooth navigation between all sections

**What Could Go Wrong**: ❌ Broken links, pages don't load, back button issues

---

## ✅ Form Validation & Data Quality Test Cases

### TEST CASE 14: Required Field Validation
**Purpose**: Verify system prevents incomplete employee records
**Business Value**: Maintains data quality and completeness

**Steps**:
1. Login and click "Add Employee"
2. **Test Empty Form Submission**:
   - Leave all fields empty
   - Click Save
   - **Verify**: Error messages appear for required fields
3. **Test Partial Information**:
   - Fill only Name field: `John Doe`
   - Leave Email and Position empty
   - Click Save
   - **Verify**: Errors show for missing Email and Position
4. **Test Complete Form**:
   - Fill all required fields properly
   - **Verify**: Form saves successfully

**Expected Result**: ✅ Clear validation messages prevent incomplete data entry

**What Could Go Wrong**: ❌ Form saves with missing data, unclear error messages

---

### TEST CASE 15: Email Format Validation
**Purpose**: Verify system only accepts valid email addresses
**Business Value**: Ensures contact information is usable and professional

**Steps**:
1. Login and add new employee
2. **Test Invalid Email Formats**:
   - `invalidemail` (no @ symbol)
   - `user@` (incomplete domain)
   - `@company.com` (no username)
   - `user@@company.com` (double @)
3. **For each invalid email**:
   - Fill other fields correctly
   - Enter invalid email
   - Click Save
   - **Verify**: Email validation error appears
4. **Test Valid Email**:
   - Enter: `john.doe@company.com`
   - **Verify**: Saves successfully

**Expected Result**: ✅ Only properly formatted emails are accepted

**What Could Go Wrong**: ❌ Invalid emails are accepted, confusing error messages

---

### TEST CASE 16: Special Characters and International Names
**Purpose**: Verify system handles diverse employee names correctly
**Business Value**: Supports international workforce and various naming conventions

**Steps**:
1. **Test International Characters**:
   - Name: `José María González`
   - Email: `jose.maria@company.com`
   - Position: `Software Engineer`
   - **Verify**: Saves and displays correctly
2. **Test Hyphenated Names**:
   - Name: `Mary-Jane Watson-Smith`
   - **Verify**: Handles correctly
3. **Test Apostrophes**: 
   - Name: `O'Connor`
   - **Verify**: Saves properly
4. **Test Long Names**:
   - Very long name (30+ characters)
   - **Verify**: Either accepts or gives clear length limit message

**Expected Result**: ✅ Diverse naming conventions are properly supported

**What Could Go Wrong**: ❌ Special characters cause errors, names get corrupted

---

## 🔄 End-to-End Business Workflow Test Cases

### TEST CASE 17: Complete Employee Lifecycle
**Purpose**: Verify entire employee management process works seamlessly
**Business Value**: Simulates real HR workflow from hiring to offboarding

**Steps**:
1. **Onboarding Simulation**:
   - Login as admin
   - Add new employee: `Sarah Johnson, sarah.johnson@company.com, Marketing Manager`
   - Verify successful addition
2. **Employee Update Simulation**:
   - After 6 months, Sarah gets promoted
   - Edit her position to `Senior Marketing Manager`
   - Verify update successful
3. **Contact Information Update**:
   - Sarah gets married and changes email
   - Update email to `sarah.wilson@company.com`
   - Verify change is saved
4. **Offboarding Simulation**:
   - Sarah leaves the company
   - Delete her record
   - Verify removal successful and confirmed
5. **Data Integrity Check**:
   - Refresh page
   - Verify all changes are persistent

**Expected Result**: ✅ Complete employee lifecycle managed successfully

**What Could Go Wrong**: ❌ Data loss, changes don't persist, workflow interruptions

---

### TEST CASE 18: Bulk Operations Testing
**Purpose**: Verify system handles multiple operations efficiently
**Business Value**: Ensures system performance during busy HR periods

**Steps**:
1. **Add Multiple Employees** (5 employees):
   - `Employee 1: John Smith, john@company.com, Developer`
   - `Employee 2: Jane Doe, jane@company.com, Designer`
   - `Employee 3: Mike Johnson, mike@company.com, Manager`
   - `Employee 4: Lisa Brown, lisa@company.com, Analyst`
   - `Employee 5: Tom Wilson, tom@company.com, Engineer`
2. **Verify All Additions**:
   - Check employee count increased by 5
   - Verify all employees appear in list
3. **Bulk Editing**:
   - Edit 3 different employees
   - Change their positions
   - Verify all changes saved
4. **Performance Check**:
   - Verify page remains responsive
   - No errors or slow loading

**Expected Result**: ✅ System handles multiple operations smoothly

**What Could Go Wrong**: ❌ System becomes slow, errors occur, data gets mixed up

---

### TEST CASE 19: Cross-Session Data Persistence
**Purpose**: Verify data remains consistent across multiple login sessions
**Business Value**: Ensures data reliability in multi-user environment

**Steps**:
1. **Session 1**:
   - Login as `admin`
   - Add employee: `Test Persistence User`
   - Note total employee count
   - Logout
2. **Session 2**:
   - Login as `user` (different account)
   - **Verify**: 
     - `Test Persistence User` is visible
     - Employee count matches previous session
   - Edit the test employee's position
   - Logout
3. **Session 3**:
   - Login as `admin` again
   - **Verify**:
     - Changes made by `user` are visible
     - Data consistency maintained
4. **Browser Restart Test**:
   - Close browser completely
   - Reopen and login
   - **Verify**: All data still present

**Expected Result**: ✅ Data remains consistent across all sessions and users

**What Could Go Wrong**: ❌ Data disappears, changes not visible to other users

---

## 🚨 Error Handling & Recovery Test Cases

### TEST CASE 20: Network Interruption Simulation
**Purpose**: Verify system handles connection issues gracefully
**Business Value**: Ensures data safety during network problems

**Steps**:
1. **Prepare Test**:
   - Login successfully
   - Navigate to add employee form
2. **Simulate Network Issue**:
   - Fill out employee form completely
   - Disconnect internet or close backend server
   - Click Save
3. **Verify Error Handling**:
   - **Check**: Clear error message appears
   - **Check**: Form data is preserved (not lost)
   - **Check**: User can retry after connection restored
4. **Test Recovery**:
   - Reconnect internet/restart server
   - Try saving again
   - **Verify**: Operation completes successfully

**Expected Result**: ✅ Graceful error handling with data preservation

**What Could Go Wrong**: ❌ Data lost, cryptic error messages, system crashes

---

### TEST CASE 21: Duplicate Data Handling
**Purpose**: Verify system prevents or handles duplicate employee records
**Business Value**: Maintains database integrity and prevents confusion

**Steps**:
1. **Add First Employee**:
   - Name: `Duplicate Test User`
   - Email: `duplicate@company.com`
   - Position: `Tester`
   - Verify successful addition
2. **Attempt Exact Duplicate**:
   - Try adding employee with identical information
   - **Verify**: System either prevents duplicate or handles appropriately
3. **Similar Employee Test**:
   - Add employee with same name but different email
   - **Verify**: System behavior is appropriate
4. **Same Email Test**:
   - Try adding different person with same email
   - **Verify**: Email uniqueness is enforced if required

**Expected Result**: ✅ System prevents problematic duplicates with clear messages

**What Could Go Wrong**: ❌ Duplicate records created, confusing error messages

---

## 📊 Performance & Load Testing (Basic)

### TEST CASE 22: Page Loading Performance
**Purpose**: Verify application loads quickly for good user experience
**Business Value**: Ensures productivity isn't hampered by slow performance

**Steps**:
1. **Login Performance**:
   - Time from clicking Login to seeing employee list
   - **Target**: Should be under 3 seconds
2. **Navigation Performance**:
   - Time to switch between pages
   - **Target**: Should be instant (under 1 second)
3. **Search Performance**:
   - Type in search box and measure response time
   - **Target**: Results should appear immediately
4. **Form Submission Performance**:
   - Time from clicking Save to seeing success message
   - **Target**: Should be under 2 seconds

**Expected Result**: ✅ All operations complete within acceptable time limits

**What Could Go Wrong**: ❌ Slow loading times, delays in responses

---

## 📋 Test Execution Checklist

### Before Starting Tests:
- [ ] Application is running (frontend and backend)
- [ ] Test accounts are available and working
- [ ] Browser is updated and compatible
- [ ] Clear browser cache and cookies

### During Testing:
- [ ] Document any bugs or issues found
- [ ] Take screenshots of problems
- [ ] Note exact steps that caused issues
- [ ] Test on different browsers if possible

### After Testing:
- [ ] Clean up test data created
- [ ] Record overall test results
- [ ] Report critical issues immediately
- [ ] Document suggestions for improvements

---

## 🎯 Success Criteria Summary

A successful test run should demonstrate:
- ✅ **Security**: Only authorized users can access the system
- ✅ **Functionality**: All CRUD operations work correctly  
- ✅ **Usability**: Interface is intuitive and responsive
- ✅ **Data Quality**: Validation prevents bad data entry
- ✅ **Performance**: System responds quickly to user actions
- ✅ **Reliability**: Data persists correctly across sessions

---

## 🆘 Troubleshooting Common Issues

### "Cannot reach application"
**Solution**: Verify frontend (localhost:5173) and backend (localhost:4000) are running

### "Login fails with correct credentials"
**Solution**: Clear browser cache/cookies, verify backend is connected to database

### "Changes don't save"
**Solution**: Check browser console for errors, verify backend connectivity

### "Page looks broken"
**Solution**: Try different browser, clear cache, check internet connection

### "Performance is very slow"
**Solution**: Restart services, check system resources, try different browser

---

*This manual testing guide covers comprehensive testing scenarios for the Employee Manager application. Each test case is designed to verify both functionality and user experience from a business perspective.*