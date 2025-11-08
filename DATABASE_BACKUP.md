# Database Backup and Migration Guide

This document explains how to backup and restore the Wardrobe Builder PostgreSQL database.

## Overview

The database backup system provides comprehensive data export and import capabilities:

**Features**:
- ✅ Full database export to timestamped JSON backups
- ✅ Includes all tables: builds, materials, suppliers, hardware, doors/drawers
- ✅ Transaction-based imports with rollback on errors
- ✅ Upsert mode for updating existing records
- ✅ Dry-run mode for previewing changes
- ✅ Detailed statistics and progress tracking
- ✅ Symlinked "latest" backup for easy access

## Database Schema

The backup system exports data from these tables:

### builds
- **Type**: User-created furniture designs (wardrobes and desks)
- **JSONB fields**: configuration, costs_json, hardware_json, extras_json, image_gallery, plinth_config, dimension_validation
- **Key columns**: id, name, furniture_type, width, height, depth, generated_image, generated_prompt

### materials
- **Type**: Carcass sheet materials (MDF, plywood, melamine)
- **Key columns**: id, name, category, type, recommended, description, usage, image

### material_options
- **Type**: Pricing and specifications for each material thickness
- **Key columns**: id, material_id, supplier_id, thickness, thickness_num, price, sku, price_per_sqm

### suppliers
- **Type**: Material and door/drawer suppliers
- **Key columns**: id, name, type, website, contact_email, contact_phone

### hardware_items
- **Type**: Hardware components (hinges, rails, handles, etc.)
- **Key columns**: id, key, name, description, category, unit_price, unit_of_measure

### door_drawer_products
- **Type**: Professional door and drawer products
- **Key columns**: id, key, name, description, category, product_type, default_width_mm, default_height_mm

### door_drawer_pricing
- **Type**: Multi-supplier pricing for door/drawer products
- **Key columns**: id, product_id, supplier_id, unit_price, lead_time_days, is_preferred

## Backup Script

### Creating a Backup

```bash
# Basic backup (saves to ./backups)
node scripts/db-backup.js

# Backup to custom directory
node scripts/db-backup.js --output=./my-backups

# Backup to specific location
node scripts/db-backup.js --output=/path/to/backups
```

### Backup Output

Each backup creates a timestamped directory with these files:

```
backups/backup-2025-11-08T20-47-00/
├── manifest.json           # Backup metadata and statistics
├── builds.json             # All furniture builds (18 builds)
├── materials.json          # Materials + options (10 materials, 25 options)
├── suppliers.json          # Supplier information (2 suppliers)
├── hardware.json           # Hardware items (7 items)
└── doors_drawers.json      # Door/drawer products + pricing (4 products, 4 pricing entries)
```

A symlink `backups/latest` points to the most recent backup.

### Backup Output Example

```
🚀 Starting database backup...

📁 Created backup directory: backups/backup-2025-11-08T20-47-00

📊 Database Statistics:
   Total Builds: 18 (11 wardrobes, 7 desks)
   Materials: 10 (25 options)
   Suppliers: 2
   Hardware: 7
   Doors/Drawers: 4 (4 pricing entries)

📦 Exporting builds...
   ✓ Exported 18 builds
🪵 Exporting materials...
   ✓ Exported 10 materials
   ✓ Exported 25 material options
🏪 Exporting suppliers...
   ✓ Exported 2 suppliers
🔧 Exporting hardware items...
   ✓ Exported 7 hardware items
🚪 Exporting doors & drawers...
   ✓ Exported 4 door/drawer products
   ✓ Exported 4 pricing entries

💾 Writing backup files...
   ✓ manifest.json
   ✓ builds.json
   ✓ materials.json
   ✓ suppliers.json
   ✓ hardware.json
   ✓ doors_drawers.json

🔗 Created symlink: backups/latest -> backup-2025-11-08T20-47-00

✅ Backup completed successfully!
📍 Location: backups/backup-2025-11-08T20-47-00
💿 Total size: 0.16 MB
```

## Migration Script

### Importing a Backup

The migration script supports several modes:

#### 1. Dry Run (Preview Changes)

```bash
# See what would be imported without making changes
node scripts/db-migrate.js ./backups/latest --dry-run
```

Output:
```
🚀 Starting database migration...

📁 Backup directory: backups/latest
🔧 Mode: DRY RUN
📋 Skip builds: NO

📋 Reading backup manifest...
   Backup created: 2025-11-08T20:47:00.570Z
   Database: postgresql://wardrobe_user:****@localhost:5432/wardrobe_builder
   Total builds: 18
   Materials: 10
   Suppliers: 2

📊 Current Database State:
   Builds: 18
   Materials: 10 (25 options)
   Suppliers: 2
   Hardware: 7
   Doors/Drawers: 4 (4 pricing entries)

🔍 DRY RUN MODE - No changes will be made
   Remove --dry-run flag to perform actual migration
```

#### 2. Insert Mode (Default)

```bash
# Insert new records, skip existing records by ID
node scripts/db-migrate.js ./backups/latest
```

This mode:
- Inserts new records that don't exist in the database
- Skips existing records (based on ID)
- Safe for importing into an existing database

#### 3. Upsert Mode

```bash
# Insert new records, update existing records
node scripts/db-migrate.js ./backups/latest --upsert
```

This mode:
- Inserts new records that don't exist in the database
- Updates existing records with new data from the backup
- Useful for synchronizing data or restoring from backups

Output:
```
🚀 Starting database migration...

📁 Backup directory: backups/latest
🔧 Mode: UPSERT
📋 Skip builds: NO

📊 Current Database State:
   Builds: 18
   Materials: 10 (25 options)
   Suppliers: 2
   Hardware: 7
   Doors/Drawers: 4 (4 pricing entries)

🏪 Importing 2 suppliers...
   ✓ Inserted: 0, Updated: 2, Skipped: 0

🔧 Importing 7 hardware items...
   ✓ Inserted: 0, Updated: 7, Skipped: 0

🪵 Importing 10 materials...
   ✓ Inserted: 0, Updated: 10, Skipped: 0

📦 Importing 25 material options...
   ✓ Inserted: 0, Updated: 25, Skipped: 0

🚪 Importing 4 door/drawer products...
   ✓ Inserted: 0, Updated: 4, Skipped: 0

💰 Importing 4 pricing entries...
   ✓ Inserted: 0, Updated: 4, Skipped: 0

📦 Importing 18 builds...
   ✓ Inserted: 0, Updated: 18, Skipped: 0

📊 Final Database State:
   Builds: 18 (+0)
   Materials: 10 (+0)
   Material Options: 25 (+0)
   Suppliers: 2 (+0)
   Hardware: 7 (+0)
   Doors/Drawers: 4 (+0)
   Pricing Entries: 4 (+0)

✅ Migration completed successfully!
```

#### 4. Skip Builds Mode

```bash
# Import only reference data (materials, suppliers, hardware)
# Skip importing builds
node scripts/db-migrate.js ./backups/latest --skip-builds
```

This mode:
- Imports suppliers, materials, hardware, door/drawer products
- Skips importing builds
- Useful for setting up a new environment with reference data only

### Migration Options

| Option | Description |
|--------|-------------|
| `--dry-run` | Preview changes without importing |
| `--upsert` | Update existing records instead of skipping them |
| `--skip-builds` | Skip importing builds (only import reference data) |

### Examples

```bash
# Preview what would be imported
node scripts/db-migrate.js ./backups/backup-2025-11-08T20-47-00 --dry-run

# Import new records only (skip existing)
node scripts/db-migrate.js ./backups/latest

# Import and update all records
node scripts/db-migrate.js ./backups/latest --upsert

# Import only reference data (no builds)
node scripts/db-migrate.js ./backups/latest --skip-builds

# Preview reference data import
node scripts/db-migrate.js ./backups/latest --skip-builds --dry-run
```

## Import Order

The migration script imports data in dependency order to respect foreign key constraints:

1. **Suppliers** (no dependencies)
2. **Hardware Items** (no dependencies)
3. **Materials** (no dependencies)
4. **Material Options** (depends on materials and suppliers)
5. **Door/Drawer Products** (no dependencies)
6. **Door/Drawer Pricing** (depends on products and suppliers)
7. **Builds** (optional - may reference materials)

## Transaction Safety

The migration script uses PostgreSQL transactions:

- All imports happen within a single transaction
- If any error occurs, the entire import is rolled back
- Database state remains consistent
- No partial imports

```javascript
await client.query('BEGIN');
try {
  // Import all tables...
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
}
```

## Common Use Cases

### 1. Backup Before Major Changes

```bash
# Create backup before making major changes
node scripts/db-backup.js

# Make your changes...

# Restore if needed
node scripts/db-migrate.js ./backups/latest --upsert
```

### 2. Migrate to Production

```bash
# 1. Backup production database
DATABASE_URL=postgresql://...@production node scripts/db-backup.js --output=./prod-backup

# 2. Backup development database
node scripts/db-backup.js --output=./dev-backup

# 3. Preview migration to production
DATABASE_URL=postgresql://...@production node scripts/db-migrate.js ./dev-backup/latest --dry-run

# 4. Migrate to production (update mode)
DATABASE_URL=postgresql://...@production node scripts/db-migrate.js ./dev-backup/latest --upsert
```

### 3. Clone Development Database

```bash
# 1. Backup development
node scripts/db-backup.js

# 2. Import to new database
DATABASE_URL=postgresql://...@new-db node scripts/db-migrate.js ./backups/latest
```

### 4. Setup New Environment

```bash
# Import only reference data (materials, suppliers, hardware)
# Skip importing builds
node scripts/db-migrate.js ./backups/latest --skip-builds
```

## Environment Variables

The scripts use the `DATABASE_URL` environment variable:

```bash
# Local development (default)
DATABASE_URL=postgresql://wardrobe_user:wardrobe_password@localhost:5432/wardrobe_builder

# Production (Neon.tech example)
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
```

You can override the database URL for specific operations:

```bash
# Backup from production
DATABASE_URL=postgresql://...@production node scripts/db-backup.js

# Import to production
DATABASE_URL=postgresql://...@production node scripts/db-migrate.js ./backups/latest
```

## Troubleshooting

### Backup Script Issues

**Problem**: Cannot connect to database
```
❌ Backup failed: Connection refused
```

**Solution**: Check database is running
```bash
# Docker
docker-compose ps db
docker-compose up -d db

# Local PostgreSQL
pg_isready -U wardrobe_user -d wardrobe_builder
```

**Problem**: Permission denied when writing backup files
```
❌ Error: EACCES: permission denied
```

**Solution**: Ensure backup directory is writable
```bash
mkdir -p backups
chmod 755 backups
```

### Migration Script Issues

**Problem**: Foreign key constraint violation
```
❌ Migration failed: violates foreign key constraint
```

**Solution**: The script imports in dependency order, but if you manually modified the backup files, ensure foreign key references are valid.

**Problem**: Duplicate key violation
```
❌ Error: duplicate key value violates unique constraint
```

**Solution**: Use `--upsert` mode to update existing records instead of inserting duplicates:
```bash
node scripts/db-migrate.js ./backups/latest --upsert
```

**Problem**: Backup directory not found
```
❌ Error: ENOENT: no such file or directory
```

**Solution**: Check the backup path exists
```bash
ls -la ./backups/
# Use the full backup directory path, not the symlink if it's broken
node scripts/db-migrate.js ./backups/backup-2025-11-08T20-47-00
```

## Automated Backups

### Using Cron (Linux/macOS)

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /path/to/wardrobe-builder && node scripts/db-backup.js --output=/path/to/backups

# Add weekly backup every Sunday at 3 AM
0 3 * * 0 cd /path/to/wardrobe-builder && node scripts/db-backup.js --output=/path/to/weekly-backups
```

### Using systemd Timer (Linux)

Create `/etc/systemd/system/wardrobe-backup.service`:
```ini
[Unit]
Description=Wardrobe Builder Database Backup

[Service]
Type=oneshot
User=your-user
WorkingDirectory=/path/to/wardrobe-builder
ExecStart=/usr/bin/node scripts/db-backup.js --output=/path/to/backups
```

Create `/etc/systemd/system/wardrobe-backup.timer`:
```ini
[Unit]
Description=Daily Wardrobe Builder Backup

[Timer]
OnCalendar=daily
OnCalendar=02:00
Persistent=true

[Install]
WantedBy=timers.target
```

Enable the timer:
```bash
sudo systemctl enable wardrobe-backup.timer
sudo systemctl start wardrobe-backup.timer
```

### Cloud Backup Integration

After creating a backup, sync to cloud storage:

```bash
# Backup and sync to AWS S3
node scripts/db-backup.js && aws s3 sync ./backups/ s3://your-bucket/wardrobe-backups/

# Backup and sync to Google Cloud Storage
node scripts/db-backup.js && gsutil rsync -r ./backups/ gs://your-bucket/wardrobe-backups/

# Backup and sync to Dropbox (using rclone)
node scripts/db-backup.js && rclone sync ./backups/ dropbox:/wardrobe-backups/
```

## Backup Retention

Keep backups organized with a retention policy:

```bash
#!/bin/bash
# Keep last 7 daily backups, 4 weekly backups

# Create backup
node scripts/db-backup.js

# Remove backups older than 7 days
find ./backups -name "backup-*" -type d -mtime +7 -exec rm -rf {} \;

# Keep one backup per week for last 4 weeks
# (Implement weekly backup logic here)
```

## Security Considerations

1. **Backup Files Contain Sensitive Data**
   - Store backups in secure locations
   - Encrypt backups before storing in the cloud
   - Use access controls on backup directories

2. **Database Credentials**
   - Never commit `.env` files with production credentials
   - Use environment variables for database URLs
   - Rotate database passwords periodically

3. **Production Migrations**
   - Always use `--dry-run` first
   - Test migrations on staging environment
   - Keep recent backups before migrations
   - Monitor database during migration

## Performance

- **Backup time**: ~1 second for 18 builds, 10 materials, 25 options
- **Backup size**: ~160 KB for full database
- **Import time**: ~2 seconds for full database with upsert mode
- **Transaction overhead**: Minimal - all operations in single transaction

## Files

- `scripts/db-backup.js` - Database backup script
- `scripts/db-migrate.js` - Database migration/import script
- `DATABASE_BACKUP.md` - This documentation
- `backups/` - Default backup directory (gitignored)

## Next Steps

- Consider implementing automated backup rotation
- Add backup verification script
- Implement incremental backups for large databases
- Add backup compression for storage efficiency
- Create restore verification tests
