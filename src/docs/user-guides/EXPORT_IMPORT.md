# Export & Import Guide

Complete guide to backing up and restoring your data.

## Overview

Export and Import features allow you to:
- ✅ Create backups of all your data
- ✅ Restore from previous backups
- ✅ Migrate data between environments
- ✅ Share setup with team members
- ✅ Archive historical data

## Export Data

### What Gets Exported

When you export, the JSON file includes:
- **All projects** - Complete details, dates, status, features
- **All features** - Names, descriptions, status, categories
- **Category order** - Your custom organization
- **Activity log** - Complete change history
- **Metadata** - Export timestamp and version

### How to Export

1. Click **"Export/Import"** button in the toolbar
2. Click **"Export to JSON"**
3. File downloads automatically to your browser's download folder
4. Filename format: `reactive-board-backup-YYYY-MM-DD.json`

### Example Filename

```
reactive-board-backup-2025-10-28.json
```

### When to Export

**Recommended Times:**
- ✅ **Weekly backups** - Regular safety net
- ✅ **Before major changes** - Safety before big edits
- ✅ **Before testing** - Preserve current state
- ✅ **End of sprint/quarter** - Archive milestones
- ✅ **Before user changes** - When team members join/leave

## Import Data

### ⚠️ Important Warning

**Importing REPLACES ALL current data!**

- All existing projects will be deleted
- All existing features will be deleted
- All activity log entries will be replaced
- This action cannot be undone

**Always export your current data first** if you want to keep it!

### How to Import

1. Click **"Export/Import"** button in the toolbar
2. Click **"Choose JSON File"**
3. Select your exported `.json` file from your computer
4. Click **"Import from File"**
5. Confirmation dialog appears - read it carefully
6. Click **"Import"** to proceed
7. Success notification confirms completion

### What Happens During Import

1. **Validation** - File is checked for valid JSON format
2. **Data Structure Check** - Verifies required fields exist
3. **Replacement** - All current data is replaced
4. **Timestamp Restoration** - Activity log dates are preserved
5. **Confirmation** - Success or error message displayed

### Common Use Cases

**Restoring from Backup:**
- Recover from accidental deletion
- Revert unwanted changes
- Fix data corruption

**Environment Migration:**
- Move from test to production
- Copy to different browser
- Switch between computers

**Team Collaboration:**
- Share board setup with new team members
- Synchronize initial state across team
- Distribute template configurations

**Archival:**
- Preserve historical snapshots
- Keep quarterly backups
- Maintain project archives

## File Format

### JSON Structure

The exported file contains:

```json
{
  "projects": [
    {
      "id": "proj_123",
      "name": "Mobile App Redesign",
      "description": "Complete UI overhaul...",
      "startDate": "2025-10-01",
      "endDate": "2025-12-31",
      "status": "In Progress",
      "features": ["feat_456", "feat_789"]
    }
  ],
  "features": [
    {
      "id": "feat_456",
      "name": "User Authentication",
      "description": "OAuth2 implementation",
      "categoryId": "cat_001",
      "status": "Active"
    }
  ],
  "categoryOrder": ["cat_001", "cat_002", "cat_003"],
  "auditLog": [
    {
      "id": "audit_001",
      "timestamp": "2025-10-28T14:30:00.000Z",
      "user": "Jane Smith",
      "action": "create",
      "entityType": "project",
      "entityName": "Mobile App Redesign"
    }
  ],
  "exportDate": "2025-10-28T15:00:00.000Z",
  "version": "2.0"
}
```

### Version Compatibility

- **Version 1.0:** Initial format (localStorage era)
- **Version 2.0:** Current format (cloud database era)

Newer versions can typically import older formats, but not vice versa.

## Best Practices

### Regular Backups

**Recommended Schedule:**
- **Daily:** For active development
- **Weekly:** For normal usage
- **Monthly:** For stable configurations
- **Before/After:** Major changes or milestones

### Naming Convention

Use descriptive names:
```
reactive-board-PROD-2025-10-28.json
reactive-board-BEFORE-MIGRATION-2025-10-28.json
reactive-board-Q4-ARCHIVE-2025-10-28.json
```

### Storage Locations

Store backups in multiple places:
- ✅ Local computer (Downloads folder)
- ✅ Cloud storage (Google Drive, Dropbox, OneDrive)
- ✅ Company network drive
- ✅ Version control (Git for JSON files)
- ✅ External hard drive

### Testing Imports

**Verify backups work:**
1. Export current data
2. Make a small test change
3. Import your backup
4. Verify data restored correctly
5. Export again to restore test change

### Team Coordination

**Before Importing:**
- ⚠️ Notify team members
- ⚠️ Choose low-activity time
- ⚠️ Coordinate to avoid conflicts
- ⚠️ Have everyone export first

## Troubleshooting

### Export Issues

**Problem:** Export button doesn't work  
**Solutions:**
- Check browser allows downloads
- Disable download blockers
- Try different browser
- Check browser console for errors

**Problem:** File is empty or corrupt  
**Solutions:**
- Check data exists (projects/features)
- Try exporting again
- Verify internet connection
- Check for error messages

### Import Issues

**Problem:** "Invalid file format" error  
**Solutions:**
- Verify file is JSON (not .txt or other)
- Check file wasn't modified manually
- Ensure file came from export feature
- Try re-downloading the file

**Problem:** Import fails silently  
**Solutions:**
- Check browser console for errors
- Verify you're logged in
- Check internet connection
- Try smaller file if very large

**Problem:** Data not showing after import  
**Solutions:**
- Refresh the page (Ctrl+R / Cmd+R)
- Check Activity Log to verify import
- Verify file contained data
- Try exporting to see current state

**Problem:** Some data missing after import  
**Solutions:**
- Check original export file for completeness
- Verify JSON structure is valid
- Look for truncation or corruption
- Re-export from source

### File Management Issues

**Problem:** Can't find downloaded file  
**Solutions:**
- Check browser's Downloads folder
- Look in default download location
- Check browser download history
- Re-export the file

**Problem:** Accidentally imported wrong file  
**Solutions:**
- Import your correct backup immediately
- Check Activity Log for what changed
- Contact admin if data lost
- Restore from team member's export

## Security Considerations

### Data in Export Files

**What's Included:**
- All project and feature data
- User names (from activity log)
- Timestamps
- Descriptions and details

**What's NOT Included:**
- Passwords or authentication tokens
- Email addresses
- User account details (beyond names)

### Sharing Export Files

**Safe to Share:**
- Within your team
- With trusted collaborators
- For migration purposes

**Be Careful:**
- Don't share publicly
- Consider sensitive project details
- Remove from shared folders after use
- Use encrypted file sharing for sensitive data

### File Storage Security

- ✅ Use encrypted cloud storage
- ✅ Set appropriate access permissions
- ✅ Regularly review who has access
- ✅ Delete old backups from shared locations

## Advanced Usage

### Automated Backups

**Browser Extension (Future):**
- Automatic scheduled exports
- Configurable frequency
- Cloud sync integration

**Manual Script:**
```javascript
// Run in browser console to trigger export
document.querySelector('[data-export-button]').click();
```

### Selective Data Import

Currently not supported, but planned:
- Import only projects
- Import only features
- Merge instead of replace
- Choose date range to import

### Version Control

**Tracking Changes:**
```bash
git add reactive-board-backup-*.json
git commit -m "Backup: End of Sprint 23"
git push origin main
```

Benefits:
- History of all changes
- Ability to diff between versions
- Team collaboration via Git
- Automatic conflict detection

## Related Documentation

- [Features Overview](./FEATURES.md) - All application features
- [Activity Log](./AUDIT_LOG.md) - Track changes
- [Troubleshooting](../technical/TROUBLESHOOTING.md) - Common issues

---

[← Back to Documentation Index](../README.md)
