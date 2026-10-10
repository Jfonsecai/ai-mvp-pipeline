// COMP-010 Shared Kernel - enumerations (CTR-003). Values are the API codes of API_SPEC.yaml
// and the CHECK values of DATA_MODEL.md. tests/contract-consistency.test.js compares them.

export const ACCOUNT_TYPES = Object.freeze(['owner', 'provider']);
export const PROVIDER_TYPES = Object.freeze(['clinic', 'independent']);
export const SPECIES = Object.freeze(['dog', 'cat']);
export const OFFERED_MODALITIES = Object.freeze(['clinic', 'home', 'both']);
export const CHOSEN_MODALITIES = Object.freeze(['clinic', 'home']);
export const APPOINTMENT_STATUSES = Object.freeze(['scheduled', 'cancelled']);
export const ORDER_STATUSES = Object.freeze(['confirmed', 'in_delivery', 'closed', 'cancelled']);

// Ordering release slices (ADR-017).
export const FEATURES = Object.freeze([
  'stock',
  'orders',
  'order_status',
  'order_cancel_owner',
  'order_cancel_provider',
]);
