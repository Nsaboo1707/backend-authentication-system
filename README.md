

\# Authentication Backend System



A RESTful authentication backend built using Node.js, Express.js, and MongoDB. This project implements user registration, login, JWT-based authentication, refresh token rotation, and protected API routes.



\## Features



\- User registration and login

\- Password hashing using bcryptjs

\- JWT access token authentication

\- Secure refresh token generation and rotation

\- Protected user profile API

\- MongoDB database integration

\- Input validation and error handling

\- Dockerized application



\## Tech Stack



\- Node.js

\- Express.js

\- MongoDB Atlas

\- Mongoose

\- JSON Web Token (JWT)

\- bcryptjs

\- Docker

\- Postman



\## Project Structure



```text

auth-backend/

├── config/

│   └── db.js

├── controllers/

│   └── authController.js

├── middleware/

│   └── authMiddleware.js

├── models/

│   └── User.js

├── routes/

│   └── authRoutes.js

├── utils/

│   └── generateTokens.js

├── screenshots/

├── .dockerignore

├── .env.example

├── .gitignore

├── Dockerfile

├── package.json

├── package-lock.json

└── server.js

```



\## Installation and Setup



\### 1. Clone the repository



```bash

git clone YOUR\_GITHUB\_REPOSITORY\_URL

cd auth-backend

```



\### 2. Install dependencies



```bash

npm install

```



\### 3. Configure environment variables



Create a `.env` file in the root directory using `.env.example` as a reference.



Configure your MongoDB connection string and JWT secret values.



\### 4. Start the development server



```bash

npm run dev

```



The backend runs at:



`http://localhost:3000`



\## API Endpoints



| Method | Endpoint | Description |

|--------|----------|-------------|

| POST | /api/auth/signup | Register a new user |

| POST | /api/auth/login | Login user |

| GET | /api/auth/me | Get authenticated user profile |

| POST | /api/auth/refresh | Generate new access and refresh tokens |



\## Docker Setup



\### Build Docker image



```bash

docker build -t auth-backend .

```



\### Run Docker container



```bash

docker run -p 3000:3000 --env-file .env auth-backend

```



\## Testing



The APIs can be tested using Postman.



Test scenarios include:



\- Successful user registration

\- Duplicate email registration

\- Signup validation errors

\- Successful login

\- Invalid login credentials

\- Accessing protected routes with a valid token

\- Accessing protected routes without a token

\- Successful refresh token rotation

\- Invalid or reused refresh tokens



Postman screenshots are included in the `screenshots` directory.



\## Security



\- Passwords are stored as bcrypt hashes.

\- Access tokens protect private routes.

\- Refresh tokens are stored as SHA-256 hashes in the database.

\- Environment variables are used for sensitive configuration.

\- `.env` and `node\_modules` are excluded from Git.



