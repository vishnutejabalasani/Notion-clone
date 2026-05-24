# Task Management App - Frontend 

This is the interactive frontend client for the Collaborative Kanban Platform. Built using React, it features a glassmorphic dark interface, real-time board updates, intuitive drag-and-drop mechanics, and Gemini-powered smart checklist generation.

---

## Technical Features

*   **Optimistic UI Drag-and-Drop**: Employs `@dnd-kit` to allow instantaneous list and card reordering, updating client-side states immediately before confirming sync with backend persistence.
*   **Real-time Collaborative Sync**: Leverages WebSockets to listen to remote board changes, updating local board layouts dynamically as other users edit or rearrange items.
*   **Lightweight State Store**: Handles global sessions and client parameters using Zustand, eliminating complex Redux boilerplate.
*   **Fluid Dark Aesthetics**: A styled visual layout built with custom CSS definitions, glassmorphism overlays, and modern Outfit/Inter typography.
*   **AI Integration Interface**: Includes an interactive trigger allowing users to query Google Gemini models directly from any card to parse and build sub-task checklists.
*   **Dynamic Notification Panel**: Features a persistent state-synchronized notification list checking for items like mentions and board shares.

---

## Technology Stack

*   **Core UI Library**: React (v19.2.6)
*   **Build Utility**: Vite (v8.0.12)
*   **Styling Engine**: Tailwind CSS (v4.3.0) with `@tailwindcss/vite` integration
*   **Routing**: React Router DOM (v7.15.1)
*   **Global State Store**: Zustand (v5.0.13)
*   **Drag-and-Drop Library**: dnd-kit (Core, Sortable, and Utilities)
*   **WebSockets**: Socket.io-client (v4.8.3)
*   **HTTP Client**: Axios (v1.16.1)
*   **Fluid Transitions**: Framer Motion (v12.38.0) and Lucide React

---

## Global State Architecture (Zustand)

The frontend manages global workspace states in `src/store/useStore.js`.

### Store Definitions
*   `user`: Holds current logged-in user profile, synchronized with `localStorage`.
*   `boards`: Holds array of boards visible or owned by user.
*   `activeBoard`: References the active board workspace.

### Store API Signature
```javascript
const useStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null });
  },
  boards: [],
  setBoards: (boards) => set({ boards }),
  activeBoard: null,
  setActiveBoard: (board) => set({ activeBoard: board }),
}));
```

---

## Drag-and-Drop Implementation Details

The workspace utilizes `@dnd-kit/core` and `@dnd-kit/sortable` inside `src/pages/BoardView.jsx` for smooth reordering.

### Key Configurations
*   **Pointer Sensor Delay**: Formulated to prevent conflicts between simple click events (which open the detailed Card edit modal) and drag movements.
    ```javascript
    const sensors = useSensors(
      useSensor(PointerSensor, { 
        activationConstraint: { delay: 250, tolerance: 5 } 
      }),
      useSensor(KeyboardSensor)
    );
    ```
*   **DragOverlay Element**: Renders a floating representation of the card being dragged so there is no layout jump or visual stutter during movements.
*   **Optimistic Reordering Flow**:
    1.  User starts drag action (`handleDragStart` sets `activeCard`).
    2.  User drops card (`handleDragEnd` maps source and destination indices).
    3.  Frontend recalculates arrays immediately (`setLists`) for zero latency.
    4.  Frontend triggers `PUT /api/boards/cards/:id` update request containing:
        ```json
        {
          "sourceListId": "...",
          "destinationListId": "...",
          "sourceIndex": 0,
          "destinationIndex": 2,
          "boardId": "..."
        }
        ```
    5.  On backend failure, frontend catches error, prompts a toast notification, and automatically triggers a fresh state sync to roll back the card position.

---

## WebSocket Collaboration System

When a user visits a board page (`/board/:id`), `BoardView.jsx` initializes a socket connection to sync multi-user activities.

### Socket Subscriptions
Inside `useEffect`, the socket joins the board room:
```javascript
const socket = io('http://localhost:5000');
socket.emit('joinBoard', id);
```

### Registered Real-Time Listeners
*   `listCreated`: Appends a new empty list column.
*   `cardCreated`: Adds the newly created card object into its targeted parent list.
*   `listUpdated`: Updates the title header of a specific list.
*   `cardUpdated`: Synchronizes changes to text, assignees, checklists, or comments.
*   `listDeleted`: Splices out and removes the specified list column.
*   `cardDeleted`: Removes the specified card from its host list.
*   `cardMoved`: Syncs concurrent drag-and-drop actions performed by other collaborators looking at the board.

---

## Routing and Views

Routes are defined in `src/App.jsx` using `react-router-dom`:

*   `/login`: Handles user login.
*   `/register`: Handles registering new profiles.
*   `/dashboard`: **Protected Route**. Lists all accessible workspaces, allows new workspace creation, board renaming, background customization, and workspace deletion.
*   `/board/:id`: **Protected Route**. Dynamic workspace view enabling lists/cards creation, dragging reordering, sharing with collaborators, commenting, adding checklists, and triggering AI task breakdowns.

---

## Project Structure

```text
frontend/
├── public/              # Static public resources
├── src/
│   ├── api/
│   │   └── axios.js     # Global HTTP client with JWT header injection interceptors
│   ├── assets/          # Static media assets
│   ├── components/      # UI components
│   │   ├── Card.jsx            # Individual card wrapper
│   │   ├── List.jsx            # Columns container with sortable strategy
│   │   ├── Navbar.jsx          # Top-level session and notification bell controls
│   │   ├── EditCardModal.jsx   # Detail edits, attachments uploads, checklists, and AI buttons
│   │   └── ShareBoardModal.jsx # Board access management and member roles panel
│   ├── pages/           # High-level layouts
│   │   ├── Dashboard.jsx       # Boards index grid (full-width)
│   │   ├── BoardView.jsx       # Interactive drag and drop boards canvas
│   │   ├── Login.jsx           # User login forms
│   │   └── Register.jsx        # User registration form
│   ├── store/
│   │   └── useStore.js         # Zustand main global variables definitions
│   ├── App.css          # Main animations and layout definitions
│   ├── index.css        # Core Tailwind imports
│   ├── main.jsx         # App mounting entrypoint
│   └── App.jsx          # Route handlers
├── eslint.config.js     # Linting standards
├── vite.config.js       # Vite build setup
└── package.json         # Dependencies and scripts definitions
```

---

## Installation and Execution

### Prerequisites
*   Node.js (v18.0.0 or higher)
*   Active running instance of [Kanban Backend Server](file:///d:/teamproject/backend/README.md) on port `5000`.

### Setup Steps

1. Navigate to the client folder:
   ```bash
   cd frontend
   ```

2. Install client dependencies:
   ```bash
   npm install
   ```

3. Confirm host setup in `src/api/axios.js`:
   ```javascript
   const api = axios.create({
     baseURL: 'http://localhost:5000/api',
   });
   ```

### Execution Commands

#### Launch Development Server (Hot Module Replacement)
```bash
npm run dev
```
Development links will display in terminal output:
*   Local Port: [http://localhost:5173/](http://localhost:5173/)

#### Compile Production Build
To create a bundled and optimized static distribution in the `/dist` directory:
```bash
npm run build
```

#### Preview Production Build Locally
```bash
npm run preview
```
