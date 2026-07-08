# PRMSC VMS — Deployment Guide

## Stack
- Next.js 16 (standalone output)
- Prisma 6 + MariaDB
- Auth.js v5
- Hostinger Object Storage (S3-compatible)
- Hostinger Cloud Hosting (Node.js)

---

## One-time Hostinger setup

### 1. MariaDB database
- Go to Hostinger panel → Databases → Create new database
- Note: DB name, DB user, DB password, DB host (usually localhost)

### 2. Object Storage bucket
- Go to Hostinger panel → Object Storage → Create bucket named `prmsc-vms`
- Set bucket to Public read
- Note: Endpoint URL, Access Key, Secret Key, Public URL

### 3. Generate AUTH_SECRET
Run locally:
```bash
openssl rand -base64 32
```
Use this value for both NEXTAUTH_SECRET and AUTH_SECRET.

### 4. Set environment variables in Hostinger Node.js app panel
Copy all keys from .env.production.example and fill in real values.
Never commit .env.production to git.

---

## Deploy (first time)

```bash
# On your local machine
git push origin main

# On Hostinger server via SSH or terminal panel
cd /home/username/prmsc-visitor-management
git pull origin main
npm ci
npm run build
npm run migrate:prod   # runs migrate deploy + idempotent seed
pm2 start npm --name "prmsc-vms" -- run start
# OR use Hostinger's built-in Node.js start button pointing to:
# node .next/standalone/server.js
```

## Deploy (subsequent updates)

```bash
git push origin main

# On server:
git pull origin main
npm ci
npm run build
npm run db:migrate     # prisma migrate deploy only — no seed
pm2 restart prmsc-vms
```

---

## Post-deployment verification checklist

- [ ] https://yourdomain.com loads login page (not a Next.js error)
- [ ] SSL certificate active — padlock shows in browser
- [ ] Login works: admin@prmsc.gov.pk / Admin@1234
- [ ] Login works: reception@prmsc.gov.pk / Recep@1234
- [ ] Dashboard loads with real stats
- [ ] Log Visit flow completes end-to-end
- [ ] Webcam capture works (requires HTTPS — won't work on plain HTTP)
- [ ] File upload fallback works if webcam denied
- [ ] Visitor photo uploads to Object Storage (check bucket in Hostinger panel)
- [ ] Photo appears on visitor card and pass page
- [ ] Pass page auto-triggers print dialog
- [ ] CSV export downloads correctly
- [ ] PDF report opens and auto-triggers print
- [ ] Admin panel: filters, pagination, export all work
- [ ] Department add/delete works
- [ ] User create/toggle works
- [ ] RECEPTIONIST cannot access /admin/* routes
- [ ] Change default passwords immediately after first login

---

## Troubleshooting

**Login fails in production**
- Check AUTH_SECRET and NEXTAUTH_SECRET are set and match
- Check NEXTAUTH_URL matches your actual domain (including https://)

**"UntrustedHost" error / `/api/auth/session` returns 500**
- `src/auth.ts` sets `trustHost: true` — required for any self-hosted deployment
  (Vercel gets host trust for free; Hostinger/self-hosted Node.js does not).
  If you still see this error, the request's Host header doesn't match what
  Auth.js expects — double check NEXTAUTH_URL and any reverse proxy/CDN in
  front of the app is forwarding the original Host header correctly.

**Database connection error**
- Verify DATABASE_URL credentials match Hostinger panel
- MariaDB on Hostinger uses localhost as host

**Photos not uploading**
- Verify S3_ACCESS_KEY, S3_SECRET_KEY, S3_ENDPOINT, S3_BUCKET are all set
- Check bucket is set to public-read in Hostinger panel
- Check S3_PUBLIC_URL matches the public URL from Hostinger panel

**Webcam not working**
- getUserMedia() requires HTTPS — confirm SSL is active
- On HTTP it only works on localhost

**Build fails on server**
- Run npm run typecheck locally first and fix all errors
- Ensure Node.js version on server is 20+ (check: node --version)

**Standalone build serves a blank page / missing CSS or images**
- `next build` with `output: "standalone"` does NOT copy static assets or the
  `public/` folder into `.next/standalone` automatically. Before starting
  `node .next/standalone/server.js` (outside Docker), copy them manually:
  ```bash
  cp -r .next/static .next/standalone/.next/static
  cp -r public .next/standalone/public
  ```
  The Dockerfile in this repo already does this via separate COPY steps.

**Prisma errors after deploy**
- Run: npx prisma migrate deploy
- If schema mismatch: npx prisma migrate status to see pending migrations
