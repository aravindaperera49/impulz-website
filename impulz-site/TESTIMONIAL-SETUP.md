# Private testimonial system setup (Cloudflare Pages)

**Do not put passwords, session secrets, or client review tokens in GitHub.**

1. In Cloudflare dashboard > Workers & Pages > your Pages project, confirm the project root directory is `impulz-site`. Pages Functions must be in `impulz-site/functions` at the Pages project root. If your Pages project uses a different root, adjust the deployment configuration before proceeding.
2. In Cloudflare > Storage & databases > D1, create database named `impulz-testimonials`.
3. Open D1 database > Console and execute the statements in `schema.sql` (one at a time if needed).
4. In Workers & Pages > your Pages project > Settings > Bindings, add a **D1 database** binding named exactly `DB`, selecting `impulz-testimonials`.
5. In project Settings > Variables and Secrets, add encrypted secrets `ADMIN_PASSWORD` (choose a new strong password; never commit it), `SESSION_SECRET` (a separate random 32+ character string). Add variable `ADMIN_USERNAME` with the chosen admin username.
6. Redeploy the Pages project. Verify `/api/testimonials` responds with an empty array, then open `/admin/testimonials.html` and sign in.
7. Generate a unique 30-day link for each client. A link can be used once. Review submissions in the admin dashboard and approve or reject them. Only approved reviews with explicit named-publication consent are published.
8. Do not share invitation links publicly. A review submitted with anonymous permission remains private until anonymous-publication support is implemented; private feedback is never published.

**Security notes:** Admin password is checked server-side; signed HttpOnly Secure SameSite cookies expire in 8 hours. D1 stores only a SHA-256 hash of each invitation token. All review submissions require a valid unexpired token. Login rate limiting should be configured in Cloudflare WAF before public use. Ensure Pages Functions run and fail closed on critical routes. Cloudflare settings must be configured manually; committing these files does not create a D1 database or deploy secrets.

Deployment trigger: Cloudflare Pages root directory is impulz-site and build output is .; redeploy to activate Pages Functions.
