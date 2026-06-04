"""
Pydantic models for the EXOA Navigation API.
"""

from pydantic import BaseModel
from typing import Optional


class NodeModel(BaseModel):
    id: str
    x: float
    y: float
    type: str
    floor: int
    label: Optional[str] = None


class EdgeModel(BaseModel):
    from_node: str  # 'from' is a reserved keyword
    to_node: str
    distance: float
    blocked: bool = False
    danger_multiplier: float = 1.0
    floor: int = 1


class GraphDataResponse(BaseModel):
    nodes: list[NodeModel]
    edges: list[EdgeModel]
    floor: int


class PathRequest(BaseModel):
    source_node: str
    floor: int = 1


class PathResponse(BaseModel):
    path: list[str]
    distance: float
    exit_node: Optional[str] = None
    found: bool


class NodeInfo(BaseModel):
    id: str
    x: float
    y: float
    type: str
    floor: int
    label: Optional[str] = None
    neighbors: list[str] = []


class EmergencyUpdate(BaseModel):
    type: str  # 'edge_blocked', 'edge_unblocked', 'status_change'
    from_node: Optional[str] = None
    to_node: Optional[str] = None
    status: Optional[str] = None
