import { ConvexError } from "convex/values";
import type { QueryCtx, MutationCtx } from "./_generated/server.d.ts";
import type { Id } from "./_generated/dataModel.d.ts";

/**
 * Helper function to get current authenticated user
 * Returns null if not authenticated
 */
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  // Preferred: Look up by email, if available
  if (identity.email) {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .unique();
    if (user) {
      return user;
    }
  }

  // Fall back to subject-based lookup (if possible)
  // e.g., subject might be "<userId>|<provider>" or just a Convex ID
  if (identity.subject) {
    try {
      // Try to parse subject - it might contain a Convex ID
      const parts = identity.subject.split("|");
      const potentialId = parts[0];
      
      // Only try if it looks like a valid Convex ID (32 characters)
      if (potentialId.length === 32) {
        const user = await ctx.db.get(potentialId as Id<"users">);
        if (user) {
          return user;
        }
      }
    } catch (error) {
      // Subject is not a valid Convex ID, continue
      console.log("[getCurrentUser] Subject is not a valid Convex ID", {
        subject: identity.subject,
      });
    }
  }

  // User not found
  return null;
}

/**
 * Helper function to require authentication
 * Throws UNAUTHENTICATED error if not authenticated
 */
export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx);
  if (!user) {
    throw new ConvexError({
      message: "User not logged in",
      code: "UNAUTHENTICATED",
    });
  }
  return user;
}

/**
 * Helper function to require admin or owner role
 * Throws FORBIDDEN error if user is not admin or owner
 */
export async function requireAdminOrOwner(ctx: QueryCtx | MutationCtx) {
  const user = await requireAuth(ctx);
  if (user.role !== "owner" && user.role !== "admin") {
    throw new ConvexError({
      message: "Not authorized",
      code: "FORBIDDEN",
    });
  }
  return user;
}

/**
 * Helper function to require owner role
 * Throws FORBIDDEN error if user is not owner
 */
export async function requireOwner(ctx: QueryCtx | MutationCtx) {
  const user = await requireAuth(ctx);
  if (user.role !== "owner") {
    throw new ConvexError({
      message: "Only owners can perform this action",
      code: "FORBIDDEN",
    });
  }
  return user;
}

/**
 * Get current user ID from auth identity
 * Returns null if not authenticated
 */
export async function getCurrentUserId(ctx: QueryCtx | MutationCtx): Promise<Id<"users"> | null> {
  const user = await getCurrentUser(ctx);
  return user?._id ?? null;
}
