# Windows quick start

Run this script from the extracted project root. It opens separate PowerShell windows for the backend and website.
Make sure PostgreSQL is running and the `utaam_medical` database exists first.

```powershell
.\start-windows.ps1
```

If your PostgreSQL password is not `root`, set it in the current PowerShell window before running:

```powershell
$env:DB_USERNAME = "postgres"
$env:DB_PASSWORD = root
```
