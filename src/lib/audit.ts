import { db } from '@/db';
import { auditLogs } from '@/db/schema';

export async function logAdminAction({
  adminId,
  adminEmail,
  action,
  entity,
  entityId,
  metadata = {},
}: {
  adminId: string;
  adminEmail: string;
  action: string;
  entity: string;
  entityId: string;
  metadata?: Record<string, any>;
}) {
  try {
    const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await db.insert(auditLogs).values({
      id: logId,
      adminId,
      adminEmail,
      action,
      entity,
      entityId,
      metadata,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
