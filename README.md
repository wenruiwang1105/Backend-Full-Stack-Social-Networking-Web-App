# Full-Stack Web App Backend

Backend service for a social networking web application built with **Node.js**, **Express**, and **MongoDB**.  
This server handles authentication, profile management, article operations, follower relationships, image uploads, and Google account linking.

## Highlights

- Session-based user authentication with cookies
- User registration, login, logout, and password update
- Profile APIs for headline, email, phone, zipcode, dob, display name, and avatar
- Article APIs for creating, retrieving, editing, and commenting on posts
- Follow and unfollow functionality
- Avatar and article image upload support
- Google OAuth account linking and unlinking
- MongoDB persistence with Mongoose models

## Tech Stack

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- Passport.js with Google OAuth
- Cloudinary

## Deployment

Backend URL:  
`https://finalw-98c0f897f482.herokuapp.com`

## Running Locally

```bash
npm install
node index.js
```


The server runs on:

`http://localhost:3000`

## Core API Endpoints

### Authentication

* `POST /register`
* `POST /login`
* `PUT /logout`
* `PUT /password`

### Profile

* `GET /headline`
* `PUT /headline`
* `GET /display`
* `PUT /display`
* `GET /email`
* `PUT /email`
* `GET /phone`
* `PUT /phone`
* `GET /zipcode`
* `PUT /zipcode`
* `GET /dob`
* `GET /avatar`
* `PUT /avatar`

### Articles

* `GET /articles`
* `GET /articles/:id`
* `POST /article`
* `POST /articleImg`
* `PUT /articles/:id`

### Following

* `GET /following`
* `PUT /following/:user`
* `DELETE /following/:user`

### OAuth

* `GET /auth/google`
* `GET /link/google`
* `PUT /unlink/google`

## Notes

* Protected routes require authentication.
* User and application data are stored in MongoDB.
* Image uploads are supported for both avatars and articles.
* It is designed to support a connected frontend.

