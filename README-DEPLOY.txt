SUPREPA — fix "No more than 12 Serverless Functions" (Hobby)

CAUSE
-----
Vercel Hobby = max 12 serverless functions.
Every .js file under /api counts as 1 function.
Your repo still had bac2-exam.js, bac3-*.js, master-*.js, etc. → >12.

FIX
---
1) DELETE from your repo ALL of these if they exist:
   api/exam.js, api/correction.js, api/exams.js
   api/bac2-*.js, api/bac3-*.js, api/master-*.js, api/licence-*.js
   (keep only api/index.js)

2) Copy from this zip into the repo root:
   api/index.js
   lib/supabase-server.js
   package.json
   vercel.json
   app.js
   scripts/...

3) npm install

4) Vercel env:
   SUPABASE_URL
   SUPABASE_SERVICE_ROLE_KEY

5) Redeploy

Verify: only 1 serverless function should appear in the deployment.
