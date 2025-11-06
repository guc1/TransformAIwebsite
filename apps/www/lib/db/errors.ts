export const POSTGRES_UNDEFINED_TABLE_CODE = "42P01";

type PgLikeError = {
  code?: unknown;
};

export function isUndefinedTableError(error: unknown): error is PgLikeError {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const code = (error as PgLikeError).code;
  return typeof code === "string" && code === POSTGRES_UNDEFINED_TABLE_CODE;
}
