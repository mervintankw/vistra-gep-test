# Vistra GEP Platform

Global Entity Platform for corporate entity management and compliance tracking.

## Overview

The Vistra GEP Platform is a comprehensive solution for managing corporate entities across multiple jurisdictions. It provides tools for entity registration, compliance tracking, reporting, and organizational hierarchy management.

## Features

- **Entity Management**: Create, update, and manage corporate entities
- **Compliance Tracking**: Monitor filing deadlines and audit requirements
- **Hierarchical Views**: Visualize ownership and organizational structures
- **Reporting**: Generate compliance and entity reports
- **User Management**: Role-based access control with multiple permission levels

## Tech Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- Redis for caching and rate limiting
- JWT-based authentication

### Frontend
- React 18 with TypeScript
- Vite for building
- TanStack Query for data fetching
- Zustand for state management
- Tailwind CSS for styling

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB 7+
- Redis 7+ (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/vistra/vistra-gep.git
cd vistra-gep

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Set up environment variables
cp .env.example .env

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

### Environment Variables

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/vistra_gep
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
```

## API Documentation

API documentation is available at `/api/v1/docs` when running the server.

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/login | User authentication |
| POST | /api/v1/auth/register | User registration |
| GET | /api/v1/entities | List entities |
| POST | /api/v1/entities | Create entity |
| GET | /api/v1/entities/:id | Get entity details |
| PUT | /api/v1/entities/:id | Update entity |
| GET | /api/v1/reports | Generate reports |

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm test -- --grep "auth"
```

## Deployment

The application is deployed using GitHub Actions to AWS ECS.

### Environments
- **Staging**: Auto-deploys on merge to `develop`
- **Production**: Manual deployment from `main`

## Contributing

1. Create a feature branch from `develop`
2. Make your changes
3. Write/update tests
4. Submit a pull request

### Branch Naming Convention
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Production hotfixes
- `release/version` - Release preparation

## License

Proprietary - Vistra Corporate Services

## Support

For support, contact the engineering team at engineering@vistra.com
