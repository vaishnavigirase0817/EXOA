"""
EXOA Backend — Isolated SOS Management Module

Manages active emergency distress signals in-memory.
No external database dependencies.
"""

from pydantic import BaseModel
from typing import Optional, List
import uuid
from datetime import datetime

class SOSAlertTrigger(BaseModel):
    user_id: str
    current_node: str
    current_floor: int
    route_status: str
    emergency_type: Optional[str] = "general"

class SOSAlert(BaseModel):
    id: str
    user_id: str
    current_node: str
    current_floor: int
    timestamp: str
    route_status: str
    emergency_type: str
    status: str  # "triggered" | "acknowledged" | "resolved"

class SOSManager:
    """In-memory store for active emergency distress signals."""

    def __init__(self):
        self.alerts: dict[str, SOSAlert] = {}

    def trigger_alert(self, payload: SOSAlertTrigger) -> SOSAlert:
        """Trigger a new SOS emergency signal."""
        alert_id = f"SOS-{uuid.uuid4().hex[:6].upper()}"
        timestamp = datetime.now().strftime("%H:%M:%S")
        
        alert = SOSAlert(
            id=alert_id,
            user_id=payload.user_id,
            current_node=payload.current_node,
            current_floor=payload.current_floor,
            timestamp=timestamp,
            route_status=payload.route_status,
            emergency_type=payload.emergency_type or "general",
            status="triggered"
        )
        self.alerts[alert_id] = alert
        return alert

    def acknowledge_alert(self, alert_id: str) -> Optional[SOSAlert]:
        """Mark an active alert as acknowledged by admin."""
        if alert_id in self.alerts:
            self.alerts[alert_id].status = "acknowledged"
            return self.alerts[alert_id]
        return None

    def resolve_alert(self, alert_id: str) -> Optional[SOSAlert]:
        """Mark an active alert as resolved."""
        if alert_id in self.alerts:
            self.alerts[alert_id].status = "resolved"
            # Keep resolved or delete it? We'll delete it to keep memory clean,
            # but return the final state of resolved alert.
            resolved_alert = self.alerts.pop(alert_id)
            return resolved_alert
        return None

    def get_active_alerts(self) -> List[SOSAlert]:
        """Get all active (triggered or acknowledged) distress signals."""
        return [alert for alert in self.alerts.values() if alert.status != "resolved"]

# Global singleton
sos_manager = SOSManager()
