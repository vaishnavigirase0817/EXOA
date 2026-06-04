import type { SOSAlert, SOSTriggerPayload } from '../types/sos';

class SOSService {
  private getApiBase(): string {
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return `${protocol}//${host}:8000`;
    }
    return `${protocol}//${window.location.host}`;
  }

  /**
   * Trigger a new SOS distress signal
   */
  async triggerSOS(payload: SOSTriggerPayload): Promise<SOSAlert> {
    const base = this.getApiBase();
    const res = await fetch(`${base}/api/sos/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error('Failed to trigger SOS signal on server');
    }
    return res.json();
  }

  /**
   * Acknowledge an active SOS signal (admin only)
   */
  async acknowledgeSOS(alertId: string): Promise<SOSAlert> {
    const base = this.getApiBase();
    const res = await fetch(`${base}/api/sos/acknowledge?alert_id=${alertId}`, {
      method: 'POST',
    });
    if (!res.ok) {
      throw new Error('Failed to acknowledge SOS signal on server');
    }
    return res.json();
  }

  /**
   * Resolve an active SOS signal (admin only)
   */
  async resolveSOS(alertId: string): Promise<SOSAlert> {
    const base = this.getApiBase();
    const res = await fetch(`${base}/api/sos/resolve?alert_id=${alertId}`, {
      method: 'POST',
    });
    if (!res.ok) {
      throw new Error('Failed to resolve SOS signal on server');
    }
    return res.json();
  }

  /**
   * Get all active (triggered or acknowledged) SOS signals
   */
  async getActiveSOS(): Promise<SOSAlert[]> {
    const base = this.getApiBase();
    try {
      const res = await fetch(`${base}/api/sos/active`);
      if (!res.ok) {
        throw new Error('Failed to fetch active SOS signals');
      }
      return res.json();
    } catch (e) {
      console.warn('Could not reach backend server for active SOS. Returning empty.');
      return [];
    }
  }
}

export const sosService = new SOSService();
export default sosService;
