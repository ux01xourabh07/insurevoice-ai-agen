# InsureVoice AI Agent

> AI-powered multilingual insurance voice assistant with real-time conversation capabilities

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2.4-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue.svg)](https://www.typescriptlang.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5%20Flash-orange.svg)](https://ai.google.dev/)

Full-stack application combining Spring Boot backend with React frontend for intelligent insurance policy assistance through natural voice conversations in multiple Indian languages.

## Project Structure

```
insurance-ai-agent/
├── backend/           # Spring Boot Backend (MVC Architecture)
│   ├── src/
│   │   └── main/
│   │       ├── java/com/insurance/agent/
│   │       │   ├── controller/    # REST Controllers
│   │       │   ├── service/       # Business Logic
│   │       │   ├── model/         # Data Models
│   │       │   └── config/        # Configuration
│   │       └── resources/
│   │           └── application.properties
│   └── pom.xml
│
└── frontend/          # React + TypeScript Frontend
    ├── components/    # React Components
    ├── hooks/         # Custom Hooks
    ├── utils/         # Utility Functions
    ├── App.tsx        # Main App Component
    └── package.json
```

## Quick Start

### Backend (Port 8080)

```bash
cd backend
mvn spring-boot:run
```

### Frontend (Port 5173)

```bash
cd frontend
npm install
npm run dev
```

## Features

- Real-time voice interaction with AI agent
- Multi-language support (English, Hindi, Gujarati, Marathi, Malayalam, Telugu, Tamil)
- Policy document management
- Session history tracking
- Audio visualization
- PDF/TXT/MD file upload support

## Architecture

**Backend (Spring Boot MVC)**
- Controller Layer: REST API endpoints
- Service Layer: Business logic and AI integration
- Model Layer: Data entities
- Config Layer: CORS and application configuration

**Frontend (React)**
- Component-based architecture
- Custom hooks for API integration
- Real-time audio processing
- Responsive UI with Tailwind CSS

## Environment Variables

**Backend:** `backend/src/main/resources/application.properties`
```
gemini.api.key=YOUR_API_KEY
```

**Frontend:** `frontend/.env.local`
```
GEMINI_API_KEY=YOUR_API_KEY
```

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/policy/instruction` - Get system instruction
- `GET /api/sessions` - Get all sessions
- `POST /api/sessions` - Save session
- `DELETE /api/sessions` - Clear sessions

## Tech Stack

**Backend:** Spring Boot 3.2, Java 17, Maven, Lombok  
**Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons  
**AI:** Google Gemini 2.5 Flash with Native Audio

## Repository Info

**Repository Name:** `insurevoice-ai-agent`  
**Description:** AI-powered multilingual insurance voice assistant with real-time conversation capabilities using Spring Boot and React

## License

MIT License

---

**Powered by PushpakO2**
