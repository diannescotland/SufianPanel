# Sufian Panel - Design Studio Manager

A client management system for graphic design businesses. Track clients, projects, invoices, and AI tool subscriptions.

---

## Quick Start Guide

### Step 1: Install Prerequisites

Before running the application, you need to install:

1. **Python 3.11+**
   - Download from: https://www.python.org/downloads/
   - **IMPORTANT:** During installation, check ✅ "Add Python to PATH"

2. **Node.js 18+**
   - Download from: https://nodejs.org/
   - Choose the **LTS** (Long Term Support) version

### Step 2: First-Time Setup

1. Download this project (ZIP or git clone)
2. Extract to any folder (e.g., `C:\SufianPanel`)
3. Double-click **`setup.bat`**
4. Wait for installation to complete (~3-5 minutes)
5. A desktop shortcut "Sufian Panel" will be created automatically

### Step 3: Daily Use

1. Double-click the **"Sufian Panel"** shortcut on your desktop
2. Wait ~15 seconds for services to start
3. Your browser will open automatically to the dashboard
4. When finished, close the terminal windows or run **`stop.bat`**

---

## Available Scripts

| Script | Purpose |
|--------|---------|
| `setup.bat` | First-time installation (run once) |
| `start.bat` | Start the application |
| `stop.bat` | Stop the application |
| `backup.bat` | Backup your database |

---

## Backup Your Data

To create a backup of your data:

1. Double-click **`backup.bat`**
2. Your database will be saved to the `backups/` folder
3. Keep these backup files safe!

---

## Login Credentials

- **Admin Panel:** http://localhost:8000/admin/
- **Username:** `sufianbh26`
- **Password:** `Bigday2626@`

---

## Troubleshooting

### "Python not found" error
- Make sure Python is installed
- During installation, you must check "Add Python to PATH"
- Restart your computer after installing Python

### "Node.js not found" error
- Make sure Node.js is installed
- Restart your computer after installing Node.js

### Application won't start
- Make sure ports 3000 and 8000 are not in use
- Run `stop.bat` first, then try `start.bat` again

### Forgot to backup?
- Your data is stored in `backend/db.sqlite3`
- You can manually copy this file to create a backup

---

## Support

For technical support, contact the developer.

---

## Currency

All amounts are displayed in **MAD** (Moroccan Dirham).
