# Activity Log Guide

## Overview

The Activity Log tracks all changes made to projects, features, and categories, recording who made each change and when.

## Accessing the Activity Log

1. Click the **"Activity Log"** tab in the main navigation
2. View all changes in reverse chronological order (newest first)
3. Scroll through complete history

## What's Tracked

### Projects
- **Create** - When a new project is added
- **Update** - When project details are modified (status, dates, features, etc.)
- **Delete** - When a project is removed

### Features
- **Create** - When a new feature is added
- **Update** - When feature details are modified
- **Delete** - When a feature is removed

### Categories
- **Reorder** - When categories are moved up or down

## Activity Display

### Color-Coded Actions

Actions are visually distinguished by color:

- 🟢 **Green** - Create actions (new projects/features)
- 🔵 **Blue** - Update actions (modifications)
- 🔴 **Red** - Delete actions (removals)
- 🟣 **Purple** - Reorder actions (category reorganization)

### Information Shown

Each activity entry displays:
- **User** - Who made the change
- **Timestamp** - Date and time of change
- **Action Type** - Create/Update/Delete/Reorder
- **Entity Type** - Project/Feature/Category
- **Entity Name** - Name of the changed item
- **Details** - Additional context (if applicable)

### Example Entries

```
🟢 Project created
Mobile App Redesign
by Jane Smith on Oct 28, 2025 at 2:45 PM

🔵 Feature updated  
User Authentication
by John Doe on Oct 28, 2025 at 2:30 PM

🔴 Project deleted
Legacy System Migration
by Jane Smith on Oct 28, 2025 at 1:15 PM

🟣 Category reordered
Security moved up
by John Doe on Oct 28, 2025 at 12:00 PM
```

## Use Cases

### Accountability
- See exactly who made each change
- Track individual contributions
- Identify who to ask about specific changes

### Timeline
- Review project evolution over time
- Understand how projects have changed
- Track when features were added

### Debugging
- Find when something was modified
- Investigate unexpected changes
- Trace back to original state

### Collaboration
- Coordinate with teammates
- Avoid duplicate work
- Stay aware of team activity

### Auditing
- Compliance and review purposes
- Historical record keeping
- Change documentation

## Data Persistence

### Storage

- Activity log is stored in the cloud database
- Shared across all team members
- History persists indefinitely
- Included in data exports

### Export/Import

The Activity Log is included when you:
- **Export data:** Full history saved in JSON
- **Import data:** History restored from backup

See [Export & Import Guide](./EXPORT_IMPORT.md) for details.

## Best Practices

### Using the Activity Log Effectively

1. **Check Before Edits**
   - Review recent changes before making major edits
   - See if someone else is working on the same thing
   - Avoid conflicts with teammates

2. **Regular Reviews**
   - Check periodically to stay updated
   - Review team activity at standup meetings
   - Track progress on projects

3. **Troubleshooting**
   - When something seems wrong, check the Activity Log
   - Find when a change occurred
   - Identify who to ask for details

4. **Documentation**
   - Use Activity Log as change documentation
   - Reference for project history
   - Audit trail for stakeholders

## Technical Details

### Audit Entry Structure

```typescript
interface AuditEntry {
  id: string;              // Unique identifier
  timestamp: Date;         // When the change occurred
  user: string;            // Who made the change
  action: 'create' | 'update' | 'delete' | 'reorder';
  entityType: 'project' | 'feature' | 'category';
  entityName: string;      // Name of the changed entity
  details?: string;        // Additional context
}
```

### Automatic Logging

All CRUD operations automatically create audit entries:
- `handleAddProject()` → logs project creation
- `handleUpdateProject()` → logs project updates
- `handleDeleteProject()` → logs project deletion
- `handleAddFeature()` → logs feature creation
- `handleUpdateFeature()` → logs feature updates
- `handleDeleteFeature()` → logs feature deletion
- `handleReorderCategory()` → logs category reordering

### Cloud Storage

- Stored in Supabase KV store under `auditLog` key
- Accessible via API: `GET /server/auditLog`
- Protected by authentication
- Shared across all users

## Limitations

### Current Limitations

1. **No Detailed Diffs**
   - Shows what changed, not the specific values
   - Doesn't show before/after comparisons
   - Future enhancement planned

2. **No Filtering**
   - Cannot filter by user or date yet
   - View is chronological only
   - Future enhancement planned

3. **No Search**
   - Cannot search activity log
   - Must scroll to find entries
   - Future enhancement planned

### Future Enhancements

Planned improvements:
- Filter by user, action type, or date range
- Search functionality
- Export audit log separately (CSV/Excel)
- Undo/redo capabilities
- Detailed change diffs (before/after values)
- Activity notifications

## Troubleshooting

### Activity Log Not Loading

**Problem:** Blank or empty activity log  
**Solutions:**
- Refresh the page
- Check internet connection
- Verify you're logged in
- Check browser console for errors

### Recent Changes Not Appearing

**Problem:** New activity not showing  
**Solutions:**
- Refresh the page to load latest data
- Verify change was saved successfully
- Check for error notifications

### Missing User Names

**Problem:** Some entries show no user  
**Solutions:**
- Historical data may not have user attribution
- User account may have been deleted
- System migrations may cause gaps

## Related Documentation

- [Features Overview](./FEATURES.md) - All application features
- [Export & Import](./EXPORT_IMPORT.md) - Backup and restore
- [Quick Start Guide](../getting-started/QUICK_START.md) - Getting started

---

[← Back to Documentation Index](../README.md)
