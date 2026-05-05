# Frontend Implementation Guide: WhatsApp Gateway

This document provides a comprehensive guide for frontend developers to integrate with the multi-tenant WhatsApp Gateway backend API.

## 1. Authentication & Security

The application uses a **Multi-Tenant** architecture with **Role-Based Access Control (RBAC)**.
Authentication is handled via **JWT (JSON Web Tokens)** or **API Keys**.

### Security Requirements:
1. **Authorization Header**: All protected endpoints require the token to be sent in the header.
   ```http
   Authorization: Bearer <your_jwt_token>
   ```
   *Note: For server-to-server calls, an API Key can be used instead of a JWT token.*
2. **CORS**: The backend is configured to accept requests from specific origins defined in `ALLOWED_ORIGINS` (default: `http://localhost:5173`).
3. **reCAPTCHA v3**: The registration endpoint requires a Google reCAPTCHA v3 token to prevent bot registrations.

### 1.1. Auth Endpoints
**Base Path:** `/api/auth`

| Method | Endpoint | Description | Auth Required | Payload / Form Data |
| :--- | :--- | :--- | :---: | :--- |
| `POST` | `/login` | Standard Login | ❌ | `identifier` (username/email), `password` |
| `POST` | `/register` | User Registration | ❌ | `username`, `email`, `password`, `recaptcha_token` |
| `POST` | `/google` | Google OAuth Login | ❌ | `token` (from Google OAuth SDK) |
| `POST` | `/refresh` | Refresh JWT Token | ❌ | `{ "refresh_token": "..." }` |
| `PUT` | `/change-password` | Change Password | ✅ | `old_password`, `new_password` |
| `GET` | `/user/:id` | Get User Profile | ✅ | - |
| `POST` | `/logout` | Logout | ✅ | - |

### 1.2. API Key Management
**Base Path:** `/api/auth/api-key`

| Method | Endpoint | Description | Auth Required | Payload |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/` | Get current API Key | ✅ | - |
| `POST`| `/regenerate`| Generate new API Key| ✅ | - |

---

## 2. Device Management

Devices represent the WhatsApp numbers connected to the gateway. Each user can manage multiple devices.

**Base Path:** `/api/devices`

| Method | Endpoint | Description | Auth Required | Payload |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/list` | List all user devices | ✅ | - |
| `POST` | `/add` | Add a new device | ✅ | `{ "name": "Device Name" }` |
| `DELETE`| `/delete` | Delete a device | ✅ | `{ "device_id": 1 }` |
| `GET` | `/qr?device_id=X` | Get QR Code to scan | ✅ | Query: `device_id` |
| `POST` | `/connect` | Connect device | ✅ | `{ "device_id": 1 }` |
| `POST` | `/disconnect`| Disconnect device | ✅ | `{ "device_id": 1 }` |
| `POST` | `/logout` | Logout device (Unlink) | ✅ | `{ "device_id": 1 }` |

---

## 3. Contact Management

Manage phone book contacts for easier target selection.

**Base Path:** `/api/contacts`

| Method | Endpoint | Description | Auth Required | Payload |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/list` | List contacts (Paginated) | ✅ | Query: `page`, `limit`, `search` |
| `POST` | `/create` | Create a contact | ✅ | `{ "name": "Budi", "phone": "081...", "category": "VIP" }` |
| `PUT` | `/update/:id`| Update a contact | ✅ | Same as create |
| `DELETE`| `/delete/:id`| Delete a contact | ✅ | - |
| `POST` | `/import` | Import CSV | ✅ | `multipart/form-data` with `file` |

---

## 4. Messaging & WhatsApp Actions

Core endpoints for sending messages instantly.

**Base Path:** `/api/whatsapp`

| Method | Endpoint | Description | Auth Required | Payload |
| :--- | :--- | :--- | :---: | :--- |
| `POST` | `/send` | Send text message | ✅ | `device_id`, `to`, `message` |
| `POST` | `/send-media`| Send media message | ✅ | `multipart/form-data`: `device_id`, `to`, `caption`, `file` |
| `POST` | `/send-poll` | Send a poll | ✅ | `device_id`, `to`, `name`, `options` (array), `max_selections` |
| `POST` | `/broadcast` | Send to multiple | ✅ | `device_id`, `target_jids` (array), `message` |
| `GET` | `/groups` | List joined groups | ✅ | Query: `device_id` |
| `POST` | `/revoke` | Pull back a message | ✅ | `device_id`, `target`, `message_id` |
| `GET` | `/logs` | Get message logs | ✅ | Query: `device_id`, `status`, `search`, `page`, `limit` |

---

## 5. Scheduler (Scheduled Messages)

Schedule messages to be sent at a specific future date and time.

**Base Path:** `/api/schedule`

| Method | Endpoint | Description | Auth Required | Payload |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/list` | List scheduled msgs | ✅ | Query: `device_id`, `status`, `search`, `page`, `limit` |
| `POST` | `/message` | Schedule a text | ✅ | `device_id`, `to`, `message`, `run_at` (RFC3339) |
| `POST` | `/media` | Schedule media | ✅ | `multipart/form-data`: `device_id`, `to`, `caption`, `run_at`, `file` |
| `POST` | `/poll` | Schedule a poll | ✅ | `device_id`, `to`, `name`, `options`, `max_selections`, `run_at` |
| `PUT` | `/update` | Update schedule | ✅ | `id`, `device_id`, `to`, `message`, `run_at` |
| `DELETE`| `/delete` | Delete schedule | ✅ | `{ "id": 1 }` |

---

## 6. Reminders (Recurring Messages)

Set up messages that repeat on an interval (e.g., every 30 days).

**Base Path:** `/api/reminders`

| Method | Endpoint | Description | Auth Required | Payload |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/list` | List reminders | ✅ | Query: `device_id`, `search`, `filter`, `page`, `limit` |
| `POST` | `/create` | Create a reminder | ✅ | `device_id`, `to`, `message`, `interval_days`, `is_group`, `next_run` (HH:mm) |
| `PUT` | `/update` | Update a reminder | ✅ | `id`, plus same fields as create |
| `DELETE`| `/delete` | Delete a reminder | ✅ | `{ "id": 1 }` |

---

## 7. Auto Reply

Manage automated responses based on keyword matching.

**Base Path:** `/api/auto-reply`

| Method | Endpoint | Description | Auth Required | Payload |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/` | List all auto replies | ✅ | - |
| `POST` | `/` | Create auto reply | ✅ | `device_id`, `keyword`, `reply_text`, `is_active` |
| `PUT` | `/:id` | Update auto reply | ✅ | Same as create |
| `DELETE`| `/:id` | Delete auto reply | ✅ | - |

---

## 8. User Management (Admin Only)

Administrative endpoints to manage application users. These routes are protected by `AdminOnly` middleware.

**Base Path:** `/api/users`

| Method | Endpoint | Description | Auth Required | Payload |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/` | List users (Paginated) | ✅ (Admin) | Query: `page`, `limit`, `search` |
| `GET` | `/:id` | Get user detail | ✅ (Admin) | - |
| `POST` | `/` | Create user | ✅ (Admin) | `username`, `email`, `password`, `role` |
| `PUT` | `/:id` | Update user | ✅ (Admin) | `username`, `email`, `password` (optional), `role` |
| `DELETE`| `/:id` | Delete user | ✅ (Admin) | - |

---

## 9. Frontend Implementation Notes

1. **RBAC Behavior**: The API logic uses the `Authorization` token to identify the user making the request. Normal users only retrieve/modify their own data (filtered by `user_id`). Admins can see all data across the platform. You **do not** need to explicitly pass `user_id` in standard payloads; the backend extracts it securely from the JWT.
2. **Error Handling**: Standardize error handling on the frontend. Expect a JSON structure `{ "error": "Message" }` when the status code is 4xx or 5xx.
3. **Form Data**: Endpoints accepting file uploads (`/api/whatsapp/send-media`, `/api/schedule/media`, `/api/contacts/import`) must have `Content-Type: multipart/form-data`.
4. **Pagination**: List endpoints generally support `page` and `limit` query parameters and return a structure like `{ "data": [...], "total": 100 }`.
