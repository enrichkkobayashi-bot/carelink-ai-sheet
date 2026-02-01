---
description: Debug Gemini API Model availability and configuration
---

Use this workflow when you encounter "404 Model Not Found" errors with Gemini API.

1. **Check API Key**: Ensure `VITE_GEMINI_API_KEY` is set in `.env.local`.
2. **List Available Models**: Run the following command to see which models are actually available for your specific API key:

   ```powershell
   # PowerShell command to fetch key and list models
   $envContent = Get-Content .env.local -Raw
   if ($envContent -match "VITE_GEMINI_API_KEY=(.*)") {
       $key = $matches[1].Trim()
       echo "Checking models for key: $key"
       Invoke-RestMethod -Uri "https://generativelanguage.googleapis.com/v1beta/models?key=$key" | Select-Object -ExpandProperty models | Select-Object -Property name, displayName
   } else {
       echo "API Key not found in .env.local"
   }
   ```

3. **Update Code**: Modify `services/geminiService.ts` to use a valid model name returned by the list command (e.g., `gemini-1.5-flash` or `gemini-2.0-flash`).
   - *Note*: Experimental models (`-exp`) often expire or change names.
4. **Verify Deployment**: If deploying to Vercel:
   - Ensure the Vercel project is connected to the *correct* GitHub repository (Settings > Git).
   - Ensure Environment Variables are set in Vercel.
   - Trigger a redeploy if necessary.
