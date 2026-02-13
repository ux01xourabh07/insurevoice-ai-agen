# Insurance AI Agent - Backend

Spring Boot backend with MVC architecture for Insurance AI Agent.

## Prerequisites
- Java 17+
- Maven 3.6+

## Setup

1. Configure API Key in `src/main/resources/application.properties`:
   ```
   gemini.api.key=YOUR_API_KEY
   ```

2. Build the project:
   ```bash
   mvn clean install
   ```

3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

The backend will start on `http://localhost:8080`

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/policy/instruction` - Get system instruction
- `GET /api/sessions` - Get all sessions
- `POST /api/sessions` - Save session
- `DELETE /api/sessions` - Clear all sessions

## Architecture

```
backend/
├── src/main/java/com/insurance/agent/
│   ├── controller/     # REST Controllers
│   ├── service/        # Business Logic
│   ├── model/          # Data Models
│   └── config/         # Configuration
└── src/main/resources/
    └── application.properties
```
