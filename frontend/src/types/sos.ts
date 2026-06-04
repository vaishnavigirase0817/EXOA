/**
 * TypeScript definitions for the EXOA Emergency SOS System
 */

export interface SOSAlert {
  id: string;
  user_id: string;
  current_node: string;
  current_floor: number;
  timestamp: string;
  route_status: string;
  emergency_type: string;
  status: 'triggered' | 'acknowledged' | 'resolved';
}

export interface SOSTriggerPayload {
  user_id: string;
  current_node: string;
  current_floor: number;
  route_status: string;
  emergency_type?: string;
}
