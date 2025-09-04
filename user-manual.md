# Matthew Connector Plugin - User Manual

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Registration](#registration)
4. [Logging In](#logging-in)
5. [Managing Your Household](#managing-your-household)
6. [Adding New Members](#adding-new-members)
7. [Updating Existing Members](#updating-existing-members)
8. [Certificate Management](#certificate-management)
9. [Troubleshooting](#troubleshooting)
10. [Support](#support)

---

## Overview

The Matthew Connector Plugin allows parish members to register their households and manage family member information through a secure web portal. The system integrates with your parish's Laravel-based Matthew application to maintain accurate records of parishioners and their sacramental history.

### Key Features

- **Household Registration**: Create and manage household accounts
- **Member Management**: Add, edit, and remove family members
- **Sacramental Records**: Track baptism, first communion, and confirmation details
- **Certificate Upload**: Upload and manage sacramental certificates
- **Secure Access**: Token-based authentication for data protection

---

## Getting Started

The plugin provides a user-friendly interface accessible through a shortcode on your parish website. Look for the parish portal section on your parish's website to begin using the system.

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- JavaScript enabled

---

## Registration

### Creating Your Household Account

1. **Navigate to the Parish Portal** on your parish website
2. **Click on the Registration tab** in the login area
3. **Fill in the required household information**:
   - **Household Name**: Enter your family name (e.g., "The Smith Family")
   - **Primary Contact Email**: Use an email address you check regularly
   - **Phone Number**: Your primary contact number
   - **Address**: Your complete mailing address
4. **Create a secure password**:
   - Use a combination of letters, numbers, and symbols
   - Make it at least 8 characters long
   - Don't use easily guessed information
5. **Click "Register Household"**
6. **Check your email** for a confirmation message

### Registration Tips

- ✅ Use a valid email address - this will be your login username
- ✅ Choose a strong password you'll remember
- ✅ Double-check your contact information for accuracy
- ✅ Keep your login credentials secure

---

## Logging In

### Accessing Your Account

1. **Go to the Parish Portal** on your parish website
2. **Enter your credentials**:
   - **Email**: The email address you used during registration
   - **Password**: Your chosen password
3. **Click "Login"**
4. **Wait for the system to authenticate** and load your household management dashboard

### If You Forget Your Password

Currently, password reset functionality requires contacting parish administration. Please reach out to your parish office with your registered email address for assistance.

---

## Managing Your Household

### Household Information Tab

Once logged in, you'll see tabs for managing different aspects of your household:

#### Updating Household Details

1. **Click on the "Household" tab**
2. **Review and update information** as needed:
   - Household name
   - Contact email
   - Phone number
   - Mailing address
3. **Click "Update Household"** to save changes
4. **Confirmation message** will appear when changes are saved

### Best Practices

- 📝 Keep contact information current for parish communications
- 📝 Update address changes promptly
- 📝 Ensure phone numbers are accurate for emergency contact

---

## Adding New Members

### Members Tab

The Members tab allows you to add and manage all household members.

#### Adding a New Family Member

1. **Click on the "Members" tab**
2. **Click "Add Member" button**
3. **Fill in the member's basic information**:
   - **First Name**: Member's given name
   - **Last Name**: Member's family name
   - **ID Number**: Any official identification number (optional)
   - **Date of Birth**: Use the date picker to select
   - **Email**: Member's personal email (if applicable)
   - **Phone**: Member's personal phone number (if applicable)
   - **Occupation**: Current job or role (optional)
   - **Skills**: Special skills or talents (optional)

#### Sacramental Information

4. **Check appropriate sacrament boxes** and fill in details:

   **Baptism**
   - ☑ Check "Baptised" if applicable
   - **Date**: When the baptism occurred
   - **Parish**: Where the baptism took place

   **First Communion**
   - ☑ Check "First Communion" if applicable
   - **Date**: When first communion was received
   - **Parish**: Where it took place

   **Confirmation**
   - ☑ Check "Confirmed" if applicable
   - **Date**: When confirmation was received
   - **Parish**: Where it took place

5. **Click "Save Member"** to create the member record

### ⚠️ Important Certificate Upload Note

**You must save the member first before uploading certificates.** When adding a new member:

- Certificate upload fields are hidden initially
- A notice displays: "Please save the member first before uploading certificates"
- After saving, certificate upload options become available
- You can then edit the member to upload certificates

---

## Updating Existing Members

### Editing Member Information

1. **In the Members tab**, find the member you want to update
2. **Click "Edit" button** next to their name
3. **Modify any information** as needed
4. **Update sacramental information** if necessary
5. **Upload or manage certificates** (see Certificate Management section)
6. **Click "Save Member"** to apply changes

### When to Update Member Records

- ✏️ Contact information changes
- ✏️ Sacraments received
- ✏️ Address updates
- ✏️ New certificates obtained

---

## Certificate Management

### Understanding Certificate Status

For each sacrament, you'll see different displays based on certificate status:

#### When No Certificate Exists
- **Help text**: "Upload a [Sacrament] certificate:"
- **File input**: Choose file button available
- **Status**: No current certificate display

#### When Certificate Exists
- **Current Certificate**: Shows "Current Certificate" with Download and Remove buttons
- **Help text**: "Replace the [Sacrament] certificate:"
- **File input**: Choose file button for replacement

### Uploading Certificates

1. **Ensure the member is saved** (required for new members)
2. **Click "Choose file"** under the appropriate sacrament
3. **Select your certificate file**:
   - **Supported formats**: PDF, JPG, JPEG, PNG
   - **Recommended**: PDF for best quality and compatibility
4. **File uploads automatically** when selected
5. **Success message** confirms upload completion

### Managing Existing Certificates

#### Downloading Certificates
- **Click "Download"** next to "Current Certificate"
- **File saves** with format: "[Member Name] [Sacrament] Certificate.[extension]"
- **Example**: "John Smith Baptism Certificate.pdf"

#### Replacing Certificates
- **Click "Choose file"** to select a new certificate
- **New file replaces** the existing certificate
- **Previous certificate** is permanently removed

#### Removing Certificates
- **Click "Remove"** next to "Current Certificate"
- **Confirm deletion** when prompted
- **Certificate is permanently deleted** from the system

### Certificate Best Practices

- 📄 Use PDF format when possible for best quality
- 📄 Ensure certificates are clearly readable
- 📄 Keep original physical certificates safe
- 📄 Upload high-resolution scans or photos
- 📄 Remove personal information not relevant to the sacrament if privacy is a concern

---

## Troubleshooting

### Common Issues and Solutions

#### Login Problems
**Issue**: Can't log in with correct credentials
- **Solution**: Ensure caps lock is off, try typing password manually
- **Contact**: Parish office if problems persist

#### Upload Failures
**Issue**: Certificate won't upload
- **Check**: File format (PDF, JPG, JPEG, PNG only)
- **Check**: File size (contact parish for size limits)
- **Try**: Different browser or device

#### Missing Information
**Issue**: Previously entered information is gone
- **Solution**: Information is saved automatically, try refreshing the page
- **Contact**: Parish office if data loss persists

#### Certificate Upload Notice
**Issue**: "Please save the member first" message appears
- **Solution**: This is normal for new members - save the member first, then edit to upload certificates

### Browser Compatibility

The system works best with modern browsers:
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Microsoft Edge
- ⚠️ Internet Explorer may have limited functionality

---

## Support

### Getting Help

#### Parish Office Contact
For technical issues, account problems, or questions about your records:
- **Contact your parish office directly**
- **Provide your registered email address**
- **Describe the specific issue you're experiencing**

#### Data Privacy
Your household and member information is:
- 🔒 Securely stored and encrypted
- 🔒 Only accessible by authorized parish staff
- 🔒 Used solely for parish administration and communication
- 🔒 Never shared with unauthorized third parties

#### System Updates
- The system may occasionally be updated with new features
- Your data remains safe during updates
- New features will be announced by your parish

---

## Quick Reference

### Common Tasks

| Task | Steps |
|------|-------|
| **Register** | Registration tab → Fill form → Register Household |
| **Login** | Enter email/password → Login |
| **Add Member** | Members tab → Add Member → Fill form → Save |
| **Upload Certificate** | Edit member → Choose file → Upload automatically |
| **Download Certificate** | Find member → Current Certificate → Download |
| **Update Info** | Edit member → Modify fields → Save |

### File Types Supported
- **PDF** (recommended)
- **JPG/JPEG**
- **PNG**

### Remember
- 💾 Save new members before uploading certificates
- 🔄 Information saves automatically when you click Save
- 📱 System works on mobile devices
- 🔒 Keep your login credentials secure

---

*This user manual is for the Matthew Connector Plugin. For technical support or questions about your parish records, please contact your parish office.*
