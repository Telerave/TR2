# Telerave app

Interactive application

## Features

## Setup

### Prerequisites
- Node.js (v14 or higher)
- yarn
- PostgreSQL

### Installation

1. Clone the repository:  git clone https://github.com/Telerave/TR2

Github token	


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

## License



