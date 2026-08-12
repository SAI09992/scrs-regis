import { EventEmitter } from 'events';

// Global Event Emitter for Next.js server runtime
declare global {
  var __socEventEmitter: EventEmitter | undefined;
}

if (!global.__socEventEmitter) {
  global.__socEventEmitter = new EventEmitter();
  global.__socEventEmitter.setMaxListeners(500);
}

export const realtimeEmitter = global.__socEventEmitter;

export type RealtimeEventType =
  | 'registration:countUpdated'
  | 'payment:statusUpdated'
  | 'announcement:new'
  | 'attendance:updated'
  | 'event:statusChanged';

export interface RealtimeMessage {
  event: RealtimeEventType;
  data: any;
  timestamp: number;
}

/**
 * Broadcast an event to all connected SSE clients
 */
export function broadcastRealtimeEvent(event: RealtimeEventType, data: any) {
  if (realtimeEmitter) {
    const payload: RealtimeMessage = {
      event,
      data,
      timestamp: Date.now(),
    };
    realtimeEmitter.emit('broadcast', payload);
  }
}
