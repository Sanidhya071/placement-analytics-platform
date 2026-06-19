# Placement Analytics & Career Guidance Platform

A full-stack web application designed to help students assess placement readiness, identify skill gaps, track applications, and receive career guidance through analytics-driven insights.

## Features

### Student Module

* Student Registration & Login
* Profile Management
* Placement Readiness Score
* Skill Gap Analysis
* Career Guidance Recommendations
* DSA Assessment Module
* Company Eligibility Checker
* Placement Drive Applications
* Application Tracking Dashboard

### Admin Module

* Admin Dashboard
* Student Directory
* Company Management
* Application Management
* Placement Analytics
* Placement Statistics

### Analytics Engine

* Readiness Score Calculation
* CGPA Evaluation
* Skills Assessment
* Project Analysis
* Certification Analysis
* DSA Performance Tracking
* Internship & Hackathon Evaluation

---

## Technology Stack

### Frontend

* Next.js 16
* React
* TypeScript
* CSS Modules
* Recharts

### Backend

* Next.js API Routes
* Prisma ORM
* MongoDB

### Authentication

* JWT Authentication
* bcrypt Password Hashing

---

## Database Models

### User

* Authentication details
* Role management

### StudentProfile

* Academic details
* Skills
* Certifications
* Projects
* Internships
* Hackathons
* Readiness Score

### Company

* Placement drive information
* Eligibility criteria

### Application

* Student applications
* Application status tracking

### DSAAssessment

* Assessment scores
* Performance history

### CareerRecommendation

* Suggested career paths
* Personalized guidance

---

## Placement Readiness Formula

The readiness score is calculated using:

| Component                | Weight |
| ------------------------ | ------ |
| CGPA                     | 25%    |
| Technical Skills         | 25%    |
| Projects                 | 20%    |
| Certifications           | 10%    |
| DSA Assessment           | 10%    |
| Internships & Hackathons | 10%    |

Maximum Score: 100

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd placement_analytics
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file:

```env
DATABASE_URL="mongodb://localhost:27017/placement_db?replicaSet=rs0"
JWT_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Generate Prisma Client

```bash
npx prisma generate
```

### Sync Database

```bash
npx prisma db push
```

### Run Development Server

```bash
npm run dev
```

Application runs on:

```text
http://localhost:3000
```

---

## Demo Data

### Students

* 5 Sample Student Profiles

### Companies

* 4 Placement Drives

### Applications

* Sample Application Records

---

## Project Structure

```text
src/
├── app/
│   ├── admin/
│   ├── student/
│   ├── api/
│   ├── login/
│   └── signup/
│
├── components/
│
├── lib/
│   ├── auth.ts
│   ├── prisma.ts
│   └── readiness.ts
│
prisma/
└── schema.prisma
```

---

## Future Enhancements

* AI Resume Analyzer
* Placement Prediction Model
* Interview Preparation Module
* Resume Scoring System
* AI Career Recommendations
* Email Notifications

---

## Author

**Sanidhya Gawande**

BTech Computer Science & Business Systems (CSBS)

JSPM Rajarshi Shahu College of Engineering

---

## License

This project is developed for academic and educational purposes.
