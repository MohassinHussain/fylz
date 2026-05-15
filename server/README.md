# FYLz Backend API

A lightweight, optimized Express.js backend for temporary file and text sharing. No third-party logins — just your own credentials.

## Architecture

```
server/
├── index.js              # Main entry point, routes, middleware, JWT auth
├── Schemas/
│   ├── FileSchema.js     # File document (code, sender, recipient, fileNames)
│   ├── UserSchema.js     # User document (username, hashed password)
│   └── UserSchema.js     # Legacy, unused
├── TextSchema.js         # Text document (textCode, sender, recipient, userText)
├── my-files/             # Uploaded files stored here (gitignored)
├── .env                  # Environment variables (gitignored)
├── .env.example          # Template for environment variables
├── package.json
└── README.md
```

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB Atlas (via Mongoose ODM)
- **Auth**: JWT (1-hour expiry) + bcrypt (password hashing)
- **File Upload**: Multer (disk storage, 20MB/file, max 10 files)
- **Archive**: Archiver (ZIP streaming)
- **Security**: Helmet, express-rate-limit, compression

## API Endpoints

### Authentication
| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/user/auth` | No | Login or register (`{ "username", "password" }`) |

### Sharing (all require JWT Bearer token)
| Method | Route | Description |
|---|---|---|
| `GET` | `/user/search?q=al` | Search users |
| `GET` | `/shares` | Get incoming shares |
| `POST` | `/file-upload` | Upload files (multipart) |
| `POST` | `/text-upload` | Upload text (JSON) |
| `POST` | `/file-get` | Retrieve by code |
| `GET` | `/download-all/:code` | Download as ZIP |
| `GET` | `/my-files/:filename` | Download individual file |

### System
| Method | Route | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/` | API status |

## Authentication Flow

1. Client sends `POST /user/auth` with `{ username, password }`
2. If username doesn't exist → account created with bcrypt-hashed password
3. If username exists → password verified with bcrypt
4. Returns JWT token (1-hour expiry) + username + `isNewUser` flag
5. Client stores token in localStorage
6. All subsequent requests include `Authorization: Bearer <token>`
7. Expired/invalid token → 401, client clears storage and shows login

## Optimizations

- **Connection pooling** (`maxPoolSize: 10`)
- **Database indexes** on username, code, sender, recipient
- **Compression** for JSON/text responses
- **Rate limiting**: 100 req/15min global, 10 req/15min auth, 20 req/15min upload
- **Static file caching** with ETags (1h)
- **ZIP streaming** — no temp files
- **`.lean()` queries** — 30-50% faster reads
- **Graceful shutdown** on SIGTERM/SIGINT

## Deployment on Render

### Environment Variables
| Variable | Description |
|---|---|
| `MONGO_STRING` | MongoDB Atlas connection string |
| `CORS_ORIGIN` | Frontend URL(s), comma-separated |
| `PORT` | Server port (Render auto-sets) |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | Secret key for signing tokens (use a strong random string) |

### Render Settings
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Health Check Path**: `/health`
