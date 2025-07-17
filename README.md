# RamSync

A secure, temporary content sharing platform with PIN-based protection and automatic expiration.

## Features

- **Dual Sharing Modes**: Quick share (no PIN) and secure share (6-digit PIN)
- **Multiple Content Types**: Text, files, or mixed content
- **Flexible Expiration**: 1 minute to 8 hours
- **Real-time Updates**: Instant content synchronization
- **Mobile-First Design**: Responsive across all devices
- **Drag & Drop**: Intuitive file upload interface
- **Auto-Cleanup**: Expired content automatically removed

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/api/health

## API Endpoints

- `POST /api/clipboard/upload` - Upload content
- `GET /api/clipboard/pin/:pin` - Retrieve by PIN
- `GET /api/clipboard/latest` - Get latest quick share
- `GET /api/files/:fileName` - Download file
- `GET /api/health` - Health check

## Security Features

- Rate limiting (5 uploads, 20 retrievals per minute)
- File type validation
- Size limits (10MB per file, 50MB total)
- Automatic content expiration
- XSS protection

## File Structure

```
src/
├── components/
│   ├── upload/          # Upload components
│   ├── retrieve/        # Retrieval components
│   ├── common/          # Shared components
│   └── layout/          # Layout components
├── store/               # State management
├── types/               # TypeScript types
├── utils/               # Utility functions
server/
├── index.js            # Express server
└── uploads/            # File storage
```

## Production Deployment

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Environment Variables**
   ```env
   PORT=3001
   NODE_ENV=production
   ```

3. **Start Production Server**
   ```bash
   npm start
   ```

## Development Notes

- Uses in-memory storage (implement database for production)
- Files stored locally (use cloud storage for production)
- CORS enabled for development
- Rate limiting configured for basic protection

## License

MIT License - see LICENSE file for details