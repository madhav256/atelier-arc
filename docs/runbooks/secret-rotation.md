# Secret rotation

Rotate every 90 days, when someone with access leaves, or immediately if a secret may have leaked. Generate values with `openssl rand -base64 48`.

| Secret | Effect of rotating | Steps |
| --- | --- | --- |
| `JWT_ACCESS_SECRET` | Access tokens stop working; browsers silently refresh | Update and redeploy |
| `JWT_REFRESH_SECRET` | Everyone is signed out | Update and redeploy; announce if planned |
| `QUOTE_SECRET` | Open checkout quotes become invalid; collectors re-quote in one click | Update and redeploy |
| Payment keys and webhook secret | Payments fail until both sides match | Create new keys in the provider dashboard, update the host, redeploy, then revoke the old keys |
| Email / storage credentials | Sending or uploads fail until updated | Create new credentials, update, redeploy, revoke old |
| `MONGODB_URI` password | Brief connection errors during the switch | Add a new database user, update, redeploy, delete the old user |

After rotating, check `/ready`, sign in, and place a test inquiry. Record the rotation date.
