import { useState, useEffect, useCallback, useRef } from 'react';
import { websocketService } from '../services/websocket';
import { sosService } from '../services/sosService';
import type { SOSAlert } from '../types/sos';

const getOrCreateUserId = (): string => {
  let id = localStorage.getItem('exoa_mock_user_id');
  if (!id) {
    id = `USR-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    localStorage.setItem('exoa_mock_user_id', id);
  }
  return id;
};

export type SOSStatus = 'idle' | 'sending' | 'active' | 'resolved';

export function useSOS() {
  const [status, setStatus] = useState<SOSStatus>('idle');
  const [activeAlert, setActiveAlert] = useState<SOSAlert | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const userId = useRef<string>(getOrCreateUserId());

  // Listen to WebSocket events for our distress alert updates
  useEffect(() => {
    // If the websocket is not already connected, connect it
    if (websocketService.getStatus() === 'disconnected') {
      websocketService.connect();
    }

    const unsubscribe = websocketService.addListener((msg) => {
      if (!activeAlert) return;

      if (msg.type === 'sos_acknowledged' && msg.id === activeAlert.id) {
        setStatus('active');
        setActiveAlert(msg.data);
      } else if (msg.type === 'sos_resolved' && msg.id === activeAlert.id) {
        setStatus('resolved');
        setActiveAlert(null);
        
        // Return to idle after a 5 second visual grace period
        const timer = setTimeout(() => {
          setStatus('idle');
        }, 5000);
        return () => clearTimeout(timer);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [activeAlert]);

  // Handle cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const triggerSOS = useCallback(async (
    currentNodeId: string,
    floor: number,
    routeStatus: string,
    emergencyType: string = 'general'
  ) => {
    if (cooldown > 0 || status === 'active' || status === 'sending') return;

    setStatus('sending');
    setError(null);

    try {
      const alert = await sosService.triggerSOS({
        user_id: userId.current,
        current_node: currentNodeId,
        current_floor: floor,
        route_status: routeStatus,
        emergency_type: emergencyType,
      });

      setActiveAlert(alert);
      setStatus('active');
      setCooldown(30); // 30-second cooldown protection
    } catch (err: any) {
      console.error('SOS Trigger Error:', err);
      setError('Could not connect to operations core. Retrying locally...');
      
      // Fallback state in case of connection failure (local emergency mode)
      const fallbackAlert: SOSAlert = {
        id: `LOCAL-${Math.floor(Math.random() * 10000)}`,
        user_id: userId.current,
        current_node: currentNodeId,
        current_floor: floor,
        timestamp: new Date().toTimeString().split(' ')[0],
        route_status: routeStatus,
        emergency_type: emergencyType,
        status: 'triggered',
      };
      setActiveAlert(fallbackAlert);
      setStatus('active');
      setCooldown(15);
    }
  }, [cooldown, status]);

  const cancelLocalSOS = useCallback(() => {
    setStatus('idle');
    setActiveAlert(null);
  }, []);

  return {
    status,
    activeAlert,
    cooldown,
    modalOpen,
    setModalOpen,
    error,
    userId: userId.current,
    triggerSOS,
    cancelLocalSOS,
  };
}
