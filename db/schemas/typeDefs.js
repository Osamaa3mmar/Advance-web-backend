import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    type: UserType!
    uid: Int
    projects: [Project!]
    tasks: [Task!]
    sentMessages: [Message!]
    receivedMessages: [Message!]
  }

  enum UserType {
    student
    admin
  }

  type Project {
    id: ID!
    name: String!
    startDate: String!
    endDate: String!
    description: String!
    status: ProjectStatus!
    category: String!
    users: [User!]
    tasks: [Task!]
  }

  enum ProjectStatus {
    canceled
    inProgress
    pending
    completed
    onHold
  }

  type Task {
    id: ID!
    name: String!
    dueDate: String!
    status: TaskStatus!
    description: String!
    project_ID: ID!
    user_ID: ID!
    project: Project!
    user: User!
  }

  enum TaskStatus {
    inProgress
    completed
    pending
  }

  type Message {
    id: ID
    sender_ID: ID!
    recever_ID: ID!
    payload: String!
    timestamp: String
    sender: User
    receiver: User
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    # User queries
    users: [User!]!
    user(id: ID!): User
    me: User

    # Project queries
    projects: [Project!]!
    project(id: ID!): Project
    userProjects(userId: ID!): [Project!]!

    # Task queries
    tasks: [Task!]!
    task(id: ID!): Task
    projectTasks(projectId: ID!): [Task!]!
    userTasks(userId: ID!): [Task!]!

    # Message queries
    messages: [Message!]!
    message(id: ID!): Message
    conversation(user1Id: ID!, user2Id: ID!): [Message!]!
  }

  type Mutation {
    # Auth mutations
    login(username: String!, password: String!): AuthPayload!
    
    # User mutations
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User
    deleteUser(id: ID!): Boolean!

    # Project mutations
    createProject(input: CreateProjectInput!): Project!
    updateProject(id: ID!, input: UpdateProjectInput!): Project
    deleteProject(id: ID!): Boolean!
    assignUserToProject(projectId: ID!, userId: ID!): Boolean!
    removeUserFromProject(projectId: ID!, userId: ID!): Boolean!

    # Task mutations
    createTask(input: CreateTaskInput!): Task!
    updateTask(id: ID!, input: UpdateTaskInput!): Task
    deleteTask(id: ID!): Boolean!

    # Message mutations
    sendMessage(input: SendMessageInput!): Message!
    deleteMessage(id: ID!): Boolean!
  }

  input CreateUserInput {
    username: String!
    password: String!
    type: UserType!
    uid: Int
  }

  input UpdateUserInput {
    username: String
    password: String
    type: UserType
    uid: Int
  }

  input CreateProjectInput {
    name: String!
    startDate: String!
    endDate: String!
    description: String!
    status: ProjectStatus!
    category: String!
  }

  input UpdateProjectInput {
    name: String
    startDate: String
    endDate: String
    description: String
    status: ProjectStatus
    category: String
  }

  input CreateTaskInput {
    name: String!
    dueDate: String!
    status: TaskStatus!
    description: String!
    project_ID: ID!
    user_ID: ID!
  }

  input UpdateTaskInput {
    name: String
    dueDate: String
    status: TaskStatus
    description: String
    project_ID: ID
    user_ID: ID
  }

  input SendMessageInput {
    sender_ID: ID!
    recever_ID: ID!
    payload: String!
  }
`;

export default typeDefs;
