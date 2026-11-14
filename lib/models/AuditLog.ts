import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
  actorId: string; // user email or id
  actorName?: string;
  action: string; // e.g. 'MENU_UPDATE', 'STOCK_TOGGLE', 'PRICE_CHANGE', 'SETTINGS_UPDATE'
  entity: string; // e.g. 'MenuItem', 'SiteSettings', 'Table', 'Category'
  entityId: string;
  before: Record<string, any>;
  after: Record<string, any>;
  at: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: String, required: true },
    actorName: { type: String },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String, required: true },
    before: { type: Schema.Types.Mixed, default: {} },
    after: { type: Schema.Types.Mixed, default: {} },
    at: { type: Date, default: Date.now, required: true },
  },
  { timestamps: false }
);

AuditLogSchema.index({ at: -1 });
AuditLogSchema.index({ entity: 1, entityId: 1 });

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
