# TSM GraphQL API

A GraphQL API for the TSM (Task and Student Management) database using Express, Apollo Server, and MySQL2.

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure the `.env` file with your database credentials:
   ```
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=tsm
   DB_PORT=3306
   JWT_SECRET=your_jwt_secret_key_here
   ```
4. Start the server:
   ```
   npm start
   ```
   For development with auto-restart:
   ```
   npm run dev
   ```

## API Structure

The API is organized into the following components:

- **Models**: Database interaction layer
- **Schemas**: GraphQL type definitions
- **Resolvers**: GraphQL resolvers for handling queries and mutations
- **Middleware**: Authentication and other middleware

## GraphQL Endpoints

The API provides the following main entities:

### Users
- Query users
- Get user by ID
- Authentication (login)
- Create, update, and delete users

### Projects
- Query projects
- Get project by ID
- Create, update, and delete projects
- Assign users to projects
- Remove users from projects

### Tasks
- Query tasks
- Get task by ID
- Create, update, and delete tasks
- Query tasks by project or user

### Messages
- Query messages
- Get message by ID
- Send and delete messages
- Get conversation between users

## Authentication

The API uses JWT for authentication. To authenticate:

1. Use the `login` mutation with username and password
2. Include the returned token in the Authorization header for subsequent requests:
   ```
   Authorization: Bearer your_token_here
   ```

## Example Queries

### Login
```graphql
mutation {
  login(username: "username", password: "password") {
    token
    user {
      id
      username
      type
    }
  }
}
```

### Get All Projects
```graphql
query {
  projects {
    id
    name
    description
    status
    users {
      id
      username
    }
    tasks {
      id
      name
      status
    }
  }
}
```

### Create a Task
```graphql
mutation {
  createTask(input: {
    name: "New Task"
    dueDate: "2025-06-01T00:00:00Z"
    status: pending
    description: "Task description"
    project_ID: 1
    user_ID: 2
  }) {
    id
    name
    status
  }
}
```
