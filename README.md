# Telerave app

Interactive track viewer application with smooth transitions and audio playback.

## Features
- Smooth track transitions with animations
- Audio playback control
- Touch and mouse wheel support
- Session-based track management
- Image preloading

## Setup

### Prerequisites
- Node.js (v14 or higher)
- yarn
- PostgreSQL

### Installation

1. Clone the repository:  git clone https://github.com/Telerave/TR2

Github token	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


env:

# Database
DATABASE_URL="postgresql://admin:Tr1221@localhost:5432/telerave"
# Server
PORT=3000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173/
CORS_ORIGIN=http://localhost:5173



bash
npx prisma migrate dev



## API Endpoints

- `POST /api/session` - Create new session
- `GET /api/track/:sessionId` - Get current track
- `GET /api/track/:sessionId/next` - Get next track
- `GET /api/track/:sessionId/prev` - Get previous track

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details


