# Deployment Strategy

## Architecture Overview

| Layer | Service | Region |
|---|---|---|
| Client | S3 + CloudFront | ap-southeast-2 |
| Server | Elastic Beanstalk | ap-southeast-2 |
| Auth | GitHub Actions OIDC | — |
| Domain | Route 53 + ACM (post-setup) | — |

---

## Client (React SPA)

- Built with Vite, output synced to an S3 bucket
- Served via CloudFront distribution
- `VITE_SERVER_URL` injected at build time via GitHub Actions secret — points to the EB server URL
- Custom domain (e.g. `buzzer.io`) to be configured after the pipeline is working:
  - Register domain via Route 53
  - Issue ACM certificate in `us-east-1` (required for CloudFront)
  - Add domain as a CloudFront alternate domain

## Server (Express + Socket.io)

- Single EC2 instance managed by Elastic Beanstalk
- Deployed as a zipped build artifact
- Elastic Beanstalk handles process management and restarts
- Uses default EB URL (e.g. `buzzer-app.ap-southeast-2.elasticbeanstalk.com`)
- `PORT` environment variable respected — EB sets this automatically

---

## GitHub Actions Workflows

### CI — runs on pull requests to `master`

- TypeScript type-check (`tsc --noEmit`) for both client and server
- Lint (if configured)
- Does **not** deploy

### CD — runs on push to `master`

Assumes CI checks have already passed.

**Client job:**
1. Authenticate to AWS via OIDC
2. `npm run build --workspace=client` (with `VITE_SERVER_URL` secret)
3. `aws s3 sync dist/ s3://<bucket>` 
4. CloudFront cache invalidation

**Server job:**
1. Authenticate to AWS via OIDC
2. `npm run build --workspace=server`
3. Zip the `server/dist/` output + `package.json`
4. Deploy to Elastic Beanstalk via `einaregilsson/beanstalk-deploy`

---

## AWS Authentication (OIDC)

No long-lived IAM access keys. GitHub Actions federates with AWS via OpenID Connect.

Setup steps (one-time):
1. Create an OIDC identity provider in IAM for `token.actions.githubusercontent.com`
2. Create an IAM role with a trust policy scoped to your GitHub repo
3. Attach a policy granting permissions to: S3, CloudFront, Elastic Beanstalk, ECR (if needed)
4. Store the IAM role ARN as a GitHub Actions secret (`AWS_ROLE_ARN`)

The workflow uses `aws-actions/configure-aws-credentials` with `role-to-assume: ${{ secrets.AWS_ROLE_ARN }}`.

---

## GitHub Secrets Required

| Secret | Used by |
|---|---|
| `AWS_ROLE_ARN` | Both workflows (OIDC) |
| `VITE_SERVER_URL` | Client CD workflow |

---

## Post-Deployment: Custom Domain

Once the pipeline is working and a domain is registered:

1. Register domain via Route 53 (recommended for simplicity)
2. Request ACM certificate in `us-east-1` for the chosen domain
3. Add the domain as a CloudFront alternate domain name
4. Create a Route 53 A record (alias) pointing to the CloudFront distribution
5. Update `VITE_SERVER_URL` if the server domain also changes
