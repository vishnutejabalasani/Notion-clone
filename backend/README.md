# Kanban Board Platform - Backend API Specification

This is the backend service for the Collaborative Kanban Platform. It manages data persistence, authentication, real-time board collaboration, and AI-driven workflows via a REST API and WebSockets.

---

## Key Features

*   **RESTful APIs**: Complete CRUD routing for Boards, Lists, Cards, User Profiles, and Notifications.
*   **Secure Authentication**: JWT-based session management, secure HTTP headers, and password encryption using bcryptjs.
*   **Real-time Collaboration**: WebSocket synchronization using Socket.io for concurrent multi-user board edits and instant state propagation.
*   **AI Productivity Assistant**: Automatic sub-task generation and task breakdowns powered by Google's Gemini models via @google/genai, featuring multi-model automatic fallback and keyword-based local fallbacks.
*   **In-app Notifications**: Room-based notification dispatching for activities (assignments, card updates, board sharing).
*   **Cloud Storage**: Cloudinary integration for card attachments and user profile avatars (integrated with Multer).

---

## Technology Stack

*   **Runtime Environment**: Node.js (v18.0.0 or higher)
*   **Web Framework**: Express (v5.2.1)
*   **Database ODM**: Mongoose (v9.6.2) with MongoDB
*   **Real-time Protocol**: Socket.io (v4.8.3)
*   **AI Integration**: Google Gemini SDK (@google/genai v2.4.0)
*   **Authentication**: JSON Web Tokens (jsonwebtoken v9.0.3) and bcryptjs (v3.0.3)
*   **Utilities**: Nodemon, Dotenv, Multer, Cloudinary

---

## Database Schemas and Models

The backend maps relationships through Mongoose schemas with cascading deletes and ordering arrays.

### User Schema (models/User.js)
```javascript
{
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePic: { type: String, default: "" }
}
```

### Board Schema (models/Board.js)
```javascript
{
  title: { type: String, required: true },
  description: { type: String, default: "" },
  background: { type: String, default: "bg-dark-950" },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['Admin', 'Editor', 'Viewer'], default: 'Editor' }
  }],
  lists: [{ type: Schema.Types.ObjectId, ref: 'List' }] // Maintains order
}
```

### List Schema (models/List.js)
```javascript
{
  title: { type: String, required: true },
  boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
  cards: [{ type: Schema.Types.ObjectId, ref: 'Card' }] // Maintains order
}
```

### Card Schema (models/Card.js)
```javascript
{
  title: { type: String, required: true },
  description: { type: String, default: "" },
  listId: { type: Schema.Types.ObjectId, ref: 'List', required: true },
  boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
  status: { type: String, default: "Pending" },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  dueDate: { type: Date },
  attachments: [{
    url: String,
    filename: String,
    addedAt: { type: Date, default: Date.now }
  }],
  assignees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  labels: [{ text: String, color: String }],
  checklists: [{
    title: String,
    items: [{ text: String, isCompleted: { type: Boolean, default: false } }]
  }],
  comments: [{
    text: String,
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }]
}
```

---

## AI Implementation and Multi-Model Fallback

The backend features a robust AI service inside `controllers/aiController.js` to split complex cards into a detailed sub-task list using Gemini. To avoid rate limits and connection issues, it tries generating content with a list of models in order:

1.  `gemini-2.5-flash`
2.  `gemini-2.0-flash`
3.  `gemini-1.5-flash-latest`
4.  `gemini-pro`

### Gemini Prompt Structure
```text
You are a project management AI assistant. I have a task titled "[TITLE]".
The description is: "[DESCRIPTION]".
Please break this task down into a logical step-by-step checklist of 5-10 items.
Return ONLY a valid JSON array of strings. No markdown, no code blocks, just the raw JSON array.
Example: ["Step 1", "Step 2", "Step 3"]
```

If all API attempts fail, the controller cascades to a local keyword-based intelligent checklist generator. For example, if the title contains "auth", "login", or "register", it returns a 10-step template including password hashing and JWT token setup. Similar local checklists are prepared for keywords like "payment", "checkout", "design", "ui", "api", and "test".

---

## Project Architecture

```text
backend/
├── config/              # Database connections and external client setup
├── controllers/         # Request handling & business logic
│   ├── aiController.js           # Gemini integration and checklists fallbacks
│   ├── authController.js         # JWT authentication, login, and registration
│   ├── boardController.js        # Board, list, and card database operations
│   └── notificationController.js # Read/unread notifications logic
├── middleware/          # JWT auth guard, uploads (Multer), and error handling
├── models/              # Mongoose data schemas (User, Board, List, Card, Notification)
├── routes/              # Express API endpoint routers
├── server.js            # Express application + HTTP + socket.io setup
├── .env                 # Server config and secret keys
└── package.json         # Scripts and package definitions
```

---

## Prerequisites and Installation

### Prerequisites
*   Node.js (v18.0.0 or higher)
*   MongoDB (running locally or a remote MongoDB Atlas connection)

### Installation Steps

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root of the `/backend` folder:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/kanban_platform
   JWT_SECRET=supersecretkanbancode_1234
   CLOUDINARY_URL=your_cloudinary_url_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

---

## Running the Server

### Development Mode (with live hot-reloading via Nodemon)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

On successful startup, the server outputs:
```text
Connected to MongoDB successfully
Server is running on port 5000
```

---

## API Endpoint Reference

All REST endpoints are prefixed with `/api`.

### Authentication (/api/auth)
*   **POST** `/register`
    *   Body: `{ "username": "name", "email": "email@test.com", "password": "pass" }`
    *   Response: JWT Token + User profile details.
*   **POST** `/login`
    *   Body: `{ "email": "email@test.com", "password": "pass" }`
    *   Response: `{ "token": "JWT_TOKEN", "user": { ... } }`
*   **GET** `/profile` (Requires Authorization Header: `Bearer JWT_TOKEN`)
    *   Response: Authenticated User Object.

### Board Management (/api/boards)
*   **GET** `/` (Requires Authorization Header)
    *   Response: Array of board objects.
*   **POST** `/` (Requires Authorization Header)
    *   Body: `{ "title": "Board Title", "description": "...", "background": "bg-dark-950" }`
    *   Response: Created Board Object.
*   **GET** `/:id` (Requires Authorization Header)
    *   Response: Populated Board Object containing ordered List and Card structures.
*   **PUT** `/:id` (Requires Authorization Header)
    *   Body: `{ "title": "...", "description": "...", "background": "..." }`
    *   Response: Updated Board Object.
*   **DELETE** `/:id` (Requires Authorization Header)
    *   Response: Success confirmation message.

### Lists Management (/api/boards/lists)
*   **POST** `/` (Requires Authorization Header)
    *   Body: `{ "title": "List Name", "boardId": "BOARD_ID" }`
    *   Response: Created List Object.
*   **PUT** `/:id` (Requires Authorization Header)
    *   Body: `{ "title": "New Title" }`
    *   Response: Updated List Object.
*   **DELETE** `/:id` (Requires Authorization Header)
    *   Response: Success confirmation message.

### Cards Management (/api/boards/cards)
*   **POST** `/` (Requires Authorization Header)
    *   Body: `{ "title": "Card Name", "listId": "LIST_ID", "boardId": "BOARD_ID" }`
    *   Response: Created Card Object.
*   **PUT** `/:id` (Requires Authorization Header)
    *   Body: Supports both reordering payloads (`{ sourceListId, destinationListId, sourceIndex, destinationIndex }`) and standard item modifications (`{ title, description, status, priority, dueDate, checklists, assignees }`).
    *   Response: Updated Card Object.
*   **DELETE** `/:id` (Requires Authorization Header)
    *   Response: Success confirmation.

### AI Utilities (/api/ai)
*   **POST** `/breakdown` (Requires Authorization Header)
    *   Body: `{ "title": "Task Title", "description": "Optional details" }`
    *   Response: `{ "checklistItems": [ "Step 1", "Step 2", ... ] }`

---

## WebSocket Events

Clients should connect socket-io protocols directly to the server port.

### Client-to-Server (Emit)
*   `joinBoard`: Registers socket connection to a room dedicated to `boardId`.
    *   Signature: `socket.emit('joinBoard', boardId)`
*   `joinUser`: Registers user session to a custom user channel for direct real-time updates and push notifications.
    *   Signature: `socket.emit('joinUser', userId)`

### Server-to-Client (Listen)
*   `listCreated`: Emitted to all clients in a board room when a list is appended.
*   `cardCreated`: Emitted to all clients in a board room when a card is created in a list.
*   `listUpdated`: Emitted when list headers are modified.
*   `cardUpdated`: Emitted when card details are updated.
*   `listDeleted`: Emitted when a list is removed.
*   `cardDeleted`: Emitted when a card is removed.
*   `cardMoved`: Emitted to sync drag-and-drop actions across all boards:
    *   Payload: `{ cardId, sourceListId, destinationListId, sourceIndex, destinationIndex }`
*   `notification`: Direct real-time push notification payload sent to the targeted user's specific room.
