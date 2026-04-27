# Content Broadcasting System

Backend-only assignment implementation for teacher content uploads, principal approval, and public subject-wise broadcasting with scheduling and rotation.

## Tech Stack

- Node.js + Express
- MySQL
- JWT authentication
- bcrypt password hashing
- Multer local file uploads
- Zod validation
- Swagger UI API documentation
- Node test runner for scheduling logic

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a MySQL database and tables:

   ```bash
   mysql -u root -p < database/schema.sql
   ```

3. Configure environment:

   ```bash
   cp .env.example .env
   ```

   Update DB credentials and `JWT_SECRET` in `.env`.

4. Seed demo users:

   ```bash
   npm run seed
   ```

5. Start the API:

   ```bash
   npm run dev
   ```

The server runs at `http://localhost:4000`. Swagger docs are available at `http://localhost:4000/docs`.

## Demo Users

These are created by `npm run seed` unless you change the seed env vars.

- Principal: `principal@example.com` / `Password123!`
- Teacher: `teacher@example.com` / `Password123!`

## Main API Flow

1. Login:

   ```http
   POST /api/auth/login
   ```

2. Teacher uploads content:

   ```http
   POST /api/content
   Authorization: Bearer <teacher-token>
   Content-Type: multipart/form-data
   ```

   Required fields: `title`, `subject`, `file`, `start_time`, `end_time`.
   Optional fields: `description`, `rotation_duration_minutes`.

3. Principal approves or rejects:

   ```http
   PATCH /api/content/:id/approve
   PATCH /api/content/:id/reject
   ```

4. Students access live content:

   ```http
   GET /api/content/live/:teacherId
   GET /api/content/live/:teacherId?subject=maths
   ```

If no approved and scheduled content is active, the API returns:

```json
{ "message": "No content available", "data": [] }
```

## Scheduling Logic

Only content that is approved and inside its teacher-defined `start_time` to `end_time` window is eligible.

Each subject rotates independently. For example, Maths content can rotate every five minutes while Science content follows its own cycle. The service calculates the elapsed minutes from the earliest active start time in that subject, applies modulo arithmetic over the total cycle duration, and returns the current item.

## Architecture Notes

- `src/controllers`: HTTP request/response layer.
- `src/routes`: Route declarations and role guards.
- `src/services`: Business logic, including approval and rotation.
- `src/models`: SQL access layer.
- `src/middlewares`: JWT auth, RBAC, upload handling, and errors.
- `database/schema.sql`: MySQL schema with indexes for live content lookup.
- `docs/openapi.json`: Swagger/OpenAPI documentation.

Private routes require JWT auth. Principal-only actions are isolated from teacher-only upload actions. Password hashes are never returned in API responses.

## Validation and Edge Cases

- Uploads allow only JPG, PNG, and GIF.
- File size limit is 10MB.
- `title`, `subject`, `start_time`, and `end_time` are mandatory.
- Rejection requires a reason.
- Pending and rejected content are never exposed by public live endpoints.
- Invalid or inactive subject filters return an empty response instead of an error.

## Tests

Run the scheduling unit tests:

```bash
npm test
```

## Scalability Notes

- The public live endpoint has rate limiting enabled.
- Live lookups are indexed by teacher, subject, status, and schedule window.
- In production, `/api/content/live` is a good Redis caching candidate with a short TTL based on the next rotation boundary.
- Uploads use local storage for the assignment; S3-compatible storage can replace the Multer disk destination without changing content approval logic.
- Approval events can be pushed to a queue for audit logging, notifications, or analytics.

## Assumptions

- MySQL is used because the assignment allows PostgreSQL or MySQL.
- A principal creates additional users through `POST /api/auth/register`; demo users are available through the seed script.
- Uploaded content is image-based because the assignment validation section specifies JPG, PNG, and GIF.
