import { AuditLog } from './models/AuditLog';

interface LogAuditParams {
  actorId: string;
  actorName?: string;
  action: string;
  entity: string;
  entityId: string;
  before: Record<string, any>;
  after: Record<string, any>;
}

export async function logAudit({
  actorId,
  actorName,
  action,
  entity,
  entityId,
  before,
  after,
}: LogAuditParams) {
  try {
    await AuditLog.create({
      actorId,
      actorName: actorName || actorId,
      action,
      entity,
      entityId,
      before,
      after,
      at: new Date(),
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
