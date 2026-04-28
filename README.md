# Content Broadcasting System

Backend-only assignment implementation for teacher content uploads, principal approval, and public subject-wise broadcasting with scheduling and rotation.

---

## 🚀 Deployment & Access

### 🌍 Production
- API Base URL  
  https://content-broadcasting-system-production-3099.up.railway.app/health

- Swagger Docs  
  https://content-broadcasting-system-production-3099.up.railway.app/docs


### 💻 Local
- API Base URL  
  http://localhost:4000

- Swagger Docs  
  http://localhost:4000/docs

---

## 🧑‍💻 Tech Stack

* Node.js + Express
* MySQL (Railway)
* JWT authentication
* bcrypt password hashing
* Multer (file uploads)
* Zod validation
* Swagger UI
* Node test runner

---

## 🔐 Test Credentials

**Principal**

* Email: [principal@example.com](mailto:principal@example.com)
* Password: Password123!

**Teacher**

* Email: [teacher@example.com](mailto:teacher@example.com)
* Password: Password123!

---

## ⚙️ Local Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env
```

3. Setup database:

```bash
mysql -u root -p < database/schema.sql
```

4. Seed users:

```bash
npm run seed
```

5. Run server:

```bash
npm run dev
```
---

## 📌 Main API Flow

### 1. Login

POST /api/auth/login

---

### 2. Upload Content (Teacher)

POST /api/content
Authorization: Bearer <teacher-token>

---

### 3. Approve / Reject (Principal)

PATCH /api/content/:id/approve
PATCH /api/content/:id/reject

---

### 4. Live Content (Public)

GET /api/content/live/:teacherId
GET /api/content/live/:teacherId?subject=maths

---

## 🔄 Scheduling Logic

* Only approved content within start_time and end_time is served
* Each subject rotates independently
* Rotation uses modulo logic on total duration
* Based on elapsed time since earliest active content

---

## 🏗️ Architecture

* controllers → request handling
* routes → API + RBAC
* services → business logic
* models → DB queries
* middlewares → auth, validation
* docs → Swagger

---

## ⚠️ Validation Rules

* Only JPG, PNG, GIF allowed
* Max file size: 10MB
* Required:

  * title
  * subject
  * start_time
  * end_time

---

## 🧪 Testing

```bash
npm test
```

---

## 📈 Scalability Notes

* Rate limiting on live API
* Indexed DB queries
* Redis caching possible
* S3-compatible storage ready
* Event-based approval extension possible

---

## 📌 Assumptions

* MySQL used (allowed in assignment)
* Image-based content only
* Demo users seeded
* RBAC enforced

---

## 🌍 Deployment

* Backend: Railway
* Database: Railway MySQL
* API Docs: Swagger

---
