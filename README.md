# 🚨 EXOA — Indoor Emergency Evacuation Navigation System

EXOA is a premium, real-time indoor evacuation pathfinding and navigation system designed for modern multi-story buildings. By scanning localized QR codes placed on room doors, users immediately get the shortest, safest route to the nearest emergency exit. The system routes through multi-floor stairwells and corridor grids using an optimized Dijkstra shortest-path engine with real-time hazard support.

---

## 🚀 Key Features

*   **Multi-Floor Pathfinding:** Fully integrates **4 distinct floors** (Ground, 1st, 2nd, and 3rd) linked dynamically by West and East staircases.
*   **Context-Aware Transitions:** Dynamically displays custom prompts (e.g., `🚶 Go to 2nd Floor Map [2F]`) in a banner when a user reaches a stairwell node, allowing seamless navigation downward to final Ground Floor exits.
*   **Interactive Testing Dashboard (`test_links.html`):** An interactive standalone HTML control panel in the root directory that lets developers configure local/network IPs and trigger navigations for any specific QR node with a single click.
*   **Real-time Hazard Blocking:** Leverages WebSockets to receive live updates from administrative panels to block/unblock corridors due to active fires, debris, or hazards, triggering instantaneous route recalculations.
*   **Beautiful Responsive UI:** Built with premium glassmorphism, smooth animations (Framer Motion), active state pulsing, and vivid color schemes (amber/orange/red emergency theme).
*   **Quick Demo Room Selector:** Built-in dropdown selectors on both the landing page (`/`) and header bar (`/nav`) allow users to test any of the 36 rooms across all floors on the fly.

---

## 🛠️ Technology Stack

### Frontend
*   **Core Framework:** React 19, TypeScript
*   **Styling & Design:** TailwindCSS (Vite Plugin)
*   **Animations:** Framer Motion (for pulsing emergency alerts, smooth banner entrances)
*   **Bundler:** Vite 8
*   **Routing:** React Router DOM 7

### Backend
*   **Core Framework:** Python 3, FastAPI
*   **Web Server:** Uvicorn (with reloading capabilities)
*   **Validation:** Pydantic (data parsing)
*   **Real-time updates:** WebSockets (for live debris blocks / emergency triggers)

---

## 📂 Repository Structure

```text
EXOA/
├── backend/
│   └── app/
│       ├── __init__.py
│       ├── main.py          # FastAPI application & WebSocket endpoints
│       ├── models.py        # Pydantic schemas
│       └── navigation.py    # Dijkstra-based pathfinding calculations
├── frontend/
│   ├── public/              # High-fidelity SVG floor maps
│   ├── src/
│   │   ├── algorithms/      # Optional local pathfinding helpers
│   │   ├── assets/          # Static assets & icons
│   │   ├── components/      # UI components (FloorMap, EmergencyBanner)
│   │   ├── data/            # Local backup graph mappings
│   │   ├── hooks/           # useNavigation Hook
│   │   ├── pages/           # HomePage & NavigationPage
│   │   ├── services/        # API and WebSocket managers
│   │   ├── types/           # TypeScript definitions
│   │   ├── App.tsx          # Main React entry & router
│   │   ├── index.css        # Tailwind styling configurations
│   │   └── main.tsx         # React DOM mount point
│   ├── vite.config.ts       # Configured with host headers & port forwarding support
│   └── package.json
├── test_links.html          # Dynamic link generation dashboard
├── requirements.txt         # Python backend dependencies
├── update_graph.py          # Helper script to compile node locations
└── README.md                # Project documentation
```

---

## ⚡ Quick Start Guide

### 1. Run the Frontend (Vite)
1.  Navigate into the `frontend` folder:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    The frontend will run at:
    *   **Local**: `http://localhost:5173`
    *   **Network**: `http://10.168.240.88:5173` *(depends on active IP)*

---

### 2. Run the Backend (FastAPI)
1.  Navigate to the root directory and create/activate a virtual environment:
    ```bash
    python -m venv venv
    venv\Scripts\activate  # Windows Powershell
    source venv/bin/activate  # macOS/Linux
    ```
2.  Install required dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Start the Uvicorn server:
    ```bash
    uvicorn backend.app.main:app --reload --port 8000
    ```
    The backend interactive API docs will be active at `http://localhost:8000/docs`.

---

## 🔌 API Endpoints Reference

The FastAPI backend exposes the following REST and WebSocket interfaces:

### REST API

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/health` | Health check endpoint. |
| **GET** | `/api/graph?floor={int}` | Retrieves the complete graph node and edge coordinates for a specific floor. |
| **POST** | `/api/navigate` | Calculates the shortest path to the nearest safe exit using Dijkstra pathfinding. |
| **GET** | `/api/node/{node_id}` | Fetches metadata and neighbor list for a specific room or corridor node. |
| **POST** | `/api/block-edge` | Places a hazard lock on an edge (e.g. fire/smoke block) and broadcasts to all clients. |
| **POST** | `/api/unblock-edge` | Removes a hazard lock on an edge and triggers route recalculation. |

### WebSockets

*   **URL:** `ws://localhost:8000/ws/navigation`
*   **Payload Types:** 
    *   `request_route`: Client sends active node and floor, server returns route.
    *   `edge_blocked` / `edge_unblocked`: Automatically pushed to clients to trigger instant client-side route recalculation.

---

## 📱 Interactive Testing Dashboard
For quick and easy local network testing:
1. Open the [test_links.html](file:///c:/Users/dipal/Desktop/Exoa/test_links.html) file directly in any web browser.
2. Enter your current machine's network IP (e.g., `10.168.240.88`).
3. Click any room box across Ground, 1st, 2nd, or 3rd floors to simulate instantly scanning that room's QR code and verifying the calculated evacuation pathing!
