import prisma from "@/lib/db/prisma";
import type { AuditAction } from "@prisma/client";

// =============================================================================
// Audit Service — Log all sensitive actions
// =============================================================================

export interface AuditLogOptions {
  userId?: string;
  action: AuditAction;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  /**
   * Log an action to the database
   */
  static async log(options: AuditLogOptions) {
    try {
      await prisma.auditLog.create({
        data: {
          userId: options.userId,
          action: options.action,
          entity: options.entity,
          entityId: options.entityId,
          metadata: options.metadata ? JSON.stringify(options.metadata) : null,
          ipAddress: options.ipAddress,
          userAgent: options.userAgent,
        },
      });
    } catch (error) {
      // We don't want audit failures to crash the main request, but we must log them
      console.error("Failed to write audit log:", error);
    }
  }

  /**
   * List audit logs with pagination and filters
   */
  static async list(options: {
    userId?: string;
    action?: AuditAction;
    entity?: string;
    entityId?: string;
    limit?: number;
    offset?: number;
  }) {
    return prisma.auditLog.findMany({
      where: {
        userId: options.userId,
        action: options.action,
        entity: options.entity,
        entityId: options.entityId,
      },
      orderBy: { createdAt: "desc" },
      take: options.limit || 50,
      skip: options.offset || 0,
      include: {
        user: { select: { name: true, email: true, username: true } },
      },
    });
  }
}
