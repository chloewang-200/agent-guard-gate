import { zodResolver as hookFormZodResolver } from "@hookform/resolvers/zod";
import type { FieldValues, Resolver } from "react-hook-form";

/**
 * Zod 4.3+ `_zod.version` doesn't match the literals baked into @hookform/resolvers/zod,
 * so TypeScript rejects `zodResolver(schema)` even though runtime behavior is correct.
 */
export function zodResolver<T extends FieldValues>(schema: unknown): Resolver<T> {
  return hookFormZodResolver(schema as never) as Resolver<T>;
}
