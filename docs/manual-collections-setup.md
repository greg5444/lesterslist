# Manual Collections Setup - Email Notifications

## Overview
Successfully implemented email notifications for user-submitted Local Jams and Learn to Play resources.

## Changes Made

### 1. Email Configuration
- **File Created**: `src/config/email.js`
- **Package**: nodemailer (already installed)
- **SMTP Settings Added to `.env`**:
  ```
  SMTP_HOST=smtp.hostinger.com
  SMTP_PORT=465
  SMTP_USER=noreply@lesterslist.com
  SMTP_PASS=YOUR_EMAIL_PASSWORD_HERE
  ADMIN_EMAIL=admin@lesterslist.com
  ```
- **⚠️ ACTION REQUIRED**: Update `SMTP_PASS` with actual password and `ADMIN_EMAIL` with the correct admin email address

### 2. Database Schema
- **Table**: LocalJams
- **New Contact Fields** (already existed in DB):
  - `ContactName` - Organizer's name
  - `ContactEmail` - Required email address
  - `ContactPhone` - Required phone number
  - `ShowPhone` - Boolean flag (0/1) to control public display of phone
- **Old Field**: `ContactPerson` still exists for backward compatibility

### 3. Local Jams Updates

#### Model: `src/models/localJamModel.js`
- Updated `create()` method to use new contact fields
- Updated `findPublished()` query to include new contact fields

#### Controller: `src/controllers/jamController.js`
- Added email validation (validates email format)
- Added email notification using `sendJamNotification()`
- Enhanced error handling with try/catch
- Shows success message even if email fails (logs error)

#### Views:
- **`src/views/jams/new.ejs`** - Submission Form:
  - Replaced single ContactPerson field with:
    - ContactName (required)
    - ContactEmail (required, email validation)
    - ContactPhone (required, tel input)
    - ShowPhone checkbox (optional, controls public visibility)
  - Added visual grouping for contact section
  - Added helper text about required fields and admin approval
  - Changed Schedule to textarea for better input

- **`src/views/jams/index.ejs`** - Listing Page:
  - Changed "Contact" to "Organizer" label
  - Displays ContactName instead of ContactPerson
  - Conditionally shows phone number only if ShowPhone is true
  - Better formatting with strong labels

### 4. Learn to Play Updates

#### Controller: `src/controllers/learnController.js`
- Added URL validation (validates link format)
- Added email notification using `sendLearnNotification()`
- Enhanced error handling with try/catch
- Shows success message even if email fails (logs error)

### 5. Email Notifications

#### Jam Notification Email:
- **Subject**: "🎵 New Jam Submission - Pending Approval"
- **Content**:
  - Jam details (name, venue, schedule, location)
  - Contact information (name, email, phone, ShowPhone preference)
  - Reminder to log in to admin panel

#### Learn Resource Notification Email:
- **Subject**: "📚 New Learning Resource Submission - Pending Approval"
- **Content**:
  - Resource details (instructor, description, external link)
  - Reminder to log in to admin panel

## Workflow

### User Submits Jam:
1. User fills out form at `/jams/new`
2. Form validates required fields (name, venue, schedule, contact name/email/phone)
3. Data saved to LocalJams table with Status='Draft'
4. Email sent to admin with all submission details
5. User sees success message

### User Submits Learning Resource:
1. User fills out form at `/learn/new`
2. Form validates required fields and URL format
3. Data saved to LearnResources table with Status='Draft'
4. Email sent to admin with submission details
5. User sees success message

### Admin Reviews:
1. Admin receives email notification
2. Admin logs in to admin panel
3. Admin can approve (Status='Published') or reject submissions

## Testing Checklist

Before going live, test the following:

- [ ] Update SMTP_PASS in .env with real password
- [ ] Update ADMIN_EMAIL in .env with correct admin address
- [ ] Test jam submission form
- [ ] Verify email is received by admin
- [ ] Test learn resource submission form
- [ ] Verify email is received by admin
- [ ] Check that ShowPhone checkbox works correctly
- [ ] Verify phone only displays when ShowPhone is true
- [ ] Test email validation (try invalid email)
- [ ] Test URL validation (try invalid URL)
- [ ] Verify Draft status is saved correctly

## Files Modified

```
.env (added SMTP settings)
src/config/email.js (created)
src/models/localJamModel.js (updated contact fields)
src/controllers/jamController.js (added email notifications)
src/controllers/learnController.js (added email notifications)
src/views/jams/new.ejs (updated form with new contact fields)
src/views/jams/index.ejs (display ContactName and conditional phone)
scripts/update-jams-schema.js (created for DB migration)
```

## Next Steps

1. **Set SMTP Credentials**: Update `.env` with actual SMTP password and admin email
2. **Test Emails**: Submit a test jam and verify email delivery
3. **Admin Panel**: Create admin interface to approve/reject submissions (if not already exists)
4. **Optional Enhancements**:
   - Add email confirmation to submitter
   - Add reCAPTCHA to prevent spam
   - Add admin notification preferences (email vs dashboard only)
