# Landing Page API Examples

## Content Endpoints

```bash
curl -s "http://localhost:3000/api/content?type=pricing" \
  -H "x-efl-api-key: $EFL_API_KEY"
```

```bash
curl -s "http://localhost:3000/api/page-content?route=/" \
  -H "x-efl-api-key: $EFL_API_KEY"
```

```bash
curl -s -X POST "http://localhost:3000/api/revalidate" \
  -H "x-efl-api-key: $EFL_API_KEY"
```

```bash
curl -s -X POST "http://localhost:3000/api/getUserRole" \
  -H "x-efl-api-key: $EFL_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"<uuid>\"}"
```

## Auth Endpoints

```bash
curl -s -X POST "http://localhost:3000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@example.com\",\"password\":\"secret\",\"firstName\":\"Ada\",\"lastName\":\"Lovelace\",\"platform\":\"teacher\"}"
```

```bash
curl -s -X POST "http://localhost:3000/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@example.com\"}"
```

```bash
curl -s -X POST "http://localhost:3000/api/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"<raw-token>\",\"password\":\"new-password\"}"
```

```bash
curl -s -X POST "http://localhost:3000/api/auth/sso-token" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=<session>" \
  -d "{\"platform\":\"teacher\"}"
```

```bash
curl -s -X POST "http://localhost:3000/api/auth/callback/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=user@example.com&password=secret&platform=teacher"
```
