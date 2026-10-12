// COMP-010 Shared Kernel - identifier format. Identifiers are canonical UUIDs (P05-ASM-005); anything
// else is the same "not found" as an unknown id (CR-006) and must never reach a uuid column, where
// PostgreSQL would answer with a cast error instead.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value) => typeof value === 'string' && UUID.test(value);
