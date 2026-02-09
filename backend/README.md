# SMS Backend API

## 📦 Project Structure

```
src/
├── index.ts           # Application entry point
├── middleware/        # Express middleware (error handling, logging, auth)
├── routes/            # API route handlers
├── controllers/       # Business logic
├── services/          # Database & external API services
├── utils/             # Helper functions
├── types/             # TypeScript type definitions
└── config/            # Configuration files
```

## 🚀 Development

```bash
npm install
npm run dev
```

## 📦 Production Build

```bash
npm run build
npm start
```

## ✨ Features

- ✅ TypeScript with strict mode
- ✅ Express.js 5.x
- ✅ Helmet for security headers
- ✅ CORS with credentials
- ✅ Compression middleware
- ✅ Error handling & logging
- ✅ Environment variables (.env)
- ✅ Source maps for debugging
