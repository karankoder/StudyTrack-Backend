# StudyTrack Backend

## Postman Collection

- The Postman collection for this API is available in the `utils` folder as `StudyTrack.postman_collection.json`.
- You can import this file directly into your Postman app to test all available endpoints.
- Alternatively, you can access the Postman collection online using the following link:

[Postman Collection Link](https://www.postman.com/karankoder/workspace/kkd-s-space/collection/34219693-12d0f689-e06e-4844-b2da-149390ddc3c9?action=share&creator=34219693)

## Deployed Server

- The backend server is deployed and accessible at:

[https://studytrack-backend.onrender.com](https://studytrack-backend.onrender.com)

## User Roles

Each user has a role assigned for access control:

- By default, users are assigned the `user` role.
- To grant admin access, manually update the user's role in the database to `admin`.

## Admin Testing

For testing admin-specific endpoints (such as chapter uploads), a sample admin user has been created:

```
{
  "name": "admin",
  "email": "admin@gmail.com"
}
```

You can log in with this user to test features restricted to admins.

---

**Note:**

- All API endpoints are prefixed with `/api/v1/`.
- For authentication, use the login/register endpoints to obtain a token (set as a cookie).
- Only admin users can upload chapters or clear the chapter cache.

---
