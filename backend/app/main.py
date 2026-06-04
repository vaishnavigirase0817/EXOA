"""
EXOA Backend — FastAPI Indoor Emergency Navigation Server

Provides:
- REST API for graph data and pathfinding
- WebSocket support for real-time emergency updates
- PostgreSQL/PostGIS-ready architecture
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional
import json
import os

from .navigation import NavigationService
from .models import (
    GraphDataResponse,
    PathRequest,
    PathResponse,
    NodeInfo,
    EmergencyUpdate,
)
from .sos_manager import sos_manager, SOSAlertTrigger, SOSAlert

app = FastAPI(
    title="EXOA Navigation API",
    description="Indoor Emergency Navigation System Backend",
    version="1.0.0",
)

# CORS for frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize navigation service
nav_service = NavigationService()

# WebSocket connection manager
class ConnectionManager:
    """Manages WebSocket connections for real-time emergency updates."""

    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass


manager = ConnectionManager()


# ===== REST API Endpoints =====

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "EXOA Navigation API", "version": "1.0.0"}


@app.get("/api/graph", response_model=GraphDataResponse)
async def get_graph_data(floor: int = Query(default=1, description="Floor number")):
    """Get the full graph data for a specific floor."""
    return nav_service.get_graph_data(floor)


@app.post("/api/navigate", response_model=PathResponse)
async def calculate_path(request: PathRequest):
    """Calculate shortest path to nearest exit from a source node."""
    return nav_service.calculate_shortest_path(request.source_node, request.floor)


@app.get("/api/node/{node_id}", response_model=NodeInfo)
async def get_node_info(node_id: str):
    """Get information about a specific node."""
    return nav_service.get_node_info(node_id)


@app.get("/api/exits")
async def get_exits(floor: int = Query(default=1)):
    """Get all exit nodes for a floor."""
    return nav_service.get_exits(floor)


@app.post("/api/block-edge")
async def block_edge(from_id: str, to_id: str):
    """Block an edge (emergency: fire, debris, etc.)."""
    nav_service.block_edge(from_id, to_id)
    # Broadcast update to all connected clients
    await manager.broadcast({
        "type": "edge_blocked",
        "from": from_id,
        "to": to_id,
    })
    return {"status": "blocked", "from": from_id, "to": to_id}


@app.post("/api/unblock-edge")
async def unblock_edge(from_id: str, to_id: str):
    """Unblock a previously blocked edge."""
    nav_service.unblock_edge(from_id, to_id)
    await manager.broadcast({
        "type": "edge_unblocked",
        "from": from_id,
        "to": to_id,
    })
    return {"status": "unblocked", "from": from_id, "to": to_id}


# ===== Emergency SOS System Endpoints =====

@app.post("/api/sos/trigger", response_model=SOSAlert)
async def trigger_sos(payload: SOSAlertTrigger):
    """Trigger a live emergency distress signal."""
    alert = sos_manager.trigger_alert(payload)
    # Broadcast alert via websocket in real-time
    await manager.broadcast({
        "type": "sos_triggered",
        "data": alert.model_dump()
    })
    return alert


@app.post("/api/sos/acknowledge", response_model=Optional[SOSAlert])
async def acknowledge_sos(alert_id: str):
    """Acknowledge a live emergency distress signal."""
    alert = sos_manager.acknowledge_alert(alert_id)
    if alert:
        await manager.broadcast({
            "type": "sos_acknowledged",
            "id": alert_id,
            "data": alert.model_dump()
        })
    return alert


@app.post("/api/sos/resolve", response_model=Optional[SOSAlert])
async def resolve_sos(alert_id: str):
    """Resolve a live emergency distress signal."""
    alert = sos_manager.resolve_alert(alert_id)
    if alert:
        await manager.broadcast({
            "type": "sos_resolved",
            "id": alert_id,
            "data": alert.model_dump()
        })
    return alert


@app.get("/api/sos/active", response_model=list[SOSAlert])
async def get_active_sos():
    """Get all currently active distress signals."""
    return sos_manager.get_active_alerts()


# ===== WebSocket Endpoint =====

@app.websocket("/ws/navigation")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket for real-time navigation updates.
    Clients receive:
    - Edge blocked/unblocked events
    - Emergency status changes
    - Route recalculation triggers
    """
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            if message.get("type") == "request_route":
                source = message.get("source_node")
                floor = message.get("floor", 1)
                result = nav_service.calculate_shortest_path(source, floor)
                await websocket.send_json({
                    "type": "route_update",
                    "data": result.model_dump(),
                })

    except WebSocketDisconnect:
        manager.disconnect(websocket)
