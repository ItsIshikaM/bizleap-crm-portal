# BizLeap Lead Management System (Mini CRM)

A full-stack Lead Management System built with **React, Node.js, Express, and MongoDB** to help businesses manage prospective customers, track pipeline stages, schedule follow-ups, and analyze conversion metrics.

## Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, Lucide Icons, Axios
- **Backend:** Node.js, Express.js, JWT Authentication, Bcryptjs
- **Database:** MongoDB Atlas & Mongoose ODM

## Architecture Overview
- **Authentication Layer:** Stateless JWT-based authentication (`POST /api/auth/register`, `POST /api/auth/login`) with `protect` middleware guarding all `/api/leads` endpoints.
- **Data Normalization & Validation:** Separate `countryCode` and `phone` fields, unique email constraint, regex validation, and server-side checks preventing follow-up dates earlier than lead creation dates.
- **Operational Views:** Dynamic KPI summary cards, multi-filter pipeline table/cards, active Follow-Up Queue (automatically excluding `Lost` and `Converted` records), and a Sales Conversion Funnel.

## Local Setup Instructions

1. **Clone the repository**
   ```bash
   git clone [https://github.com/ItsIshikaM/bizleap-lead-crm.git](https://github.com/ItsIshikaM/bizleap-lead-crm.git)
   cd bizleap-lead-crm