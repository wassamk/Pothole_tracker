 1. MongoDB must be running locally
 2. Install deps
cd fix-karachi/backend && pnpm install
cd ../frontend && pnpm install

 3. Seed admin user
cd ../backend && pnpm seed

 4. Run both (two terminals)
pnpm dev   # backend → :5000
cd ../frontend && pnpm dev  # frontend → :5173

Admin login Credentials: 

Email: admin@fixkarachi.pk
Password: Admin@1234