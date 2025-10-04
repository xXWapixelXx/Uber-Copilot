# 🔧 Fix PowerShell Execution Policy

## Problem
```
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled
```

## Solution Options

### ✅ Option 1: Permanent Fix (Recommended)

1. **Open PowerShell as Administrator**
   - Press `Win + X`
   - Select "Windows PowerShell (Admin)" or "Terminal (Admin)"

2. **Run this command:**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. **Type `Y` and press Enter**

4. **Close and reopen your terminal**

5. **Test it:**
   ```bash
   npm start
   ```

**This allows you to run npm, git, and other scripts permanently!**

---

### Option 2: One-Time Bypass (Quick Fix)

Use this prefix each time:
```bash
powershell -ExecutionPolicy Bypass -Command "npm start"
```

---

### Option 3: Use Command Prompt Instead

1. Open **Command Prompt** (not PowerShell)
2. Navigate to your project:
   ```cmd
   cd C:\Users\mazer\OneDrive\Documenten\GitHub\Uber-Copilot\frontend
   ```
3. Run:
   ```cmd
   npm start
   ```

**Command Prompt doesn't have execution policy restrictions!**

---

### Option 4: Use Git Bash (If installed)

If you have Git installed:
1. Open Git Bash
2. Navigate to project
3. Run `npm start`

---

## What Each Policy Means

| Policy | What it does |
|--------|--------------|
| `Restricted` | No scripts (current - blocking npm) |
| `RemoteSigned` | Local scripts OK, downloaded need signature ✅ |
| `Unrestricted` | All scripts (less secure) |

---

## Recommended Solution

**For developers, use RemoteSigned:**

```powershell
# Open PowerShell as Admin
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

This is:
- ✅ Safe for development
- ✅ Allows npm, git, yarn
- ✅ Permanent
- ✅ Only affects your user
- ✅ Doesn't require admin for every command

---

## Quick Test

After fixing, test with:
```bash
npm --version
npm start
```

Both should work without errors!
