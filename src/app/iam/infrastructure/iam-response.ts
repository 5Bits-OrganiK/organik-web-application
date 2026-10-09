/**
 * Raw response contract for the users endpoint.
 */
export interface UsersResponse {
  users: UserResource[];
}

/**
 * Raw user resource exchanged with the backend.
 */
export interface UserResource {
  id: string;
  fullName: string;
  email: string;
  role: string;
  assignedModule: string;
  status: string;
  notes: string;
  /** Minimarket the user works for; empty for suppliers. */
  minimarketId?: string;
  /** Supplier company the user works for. */
  supplierId?: string | null;
  plan?: string;
}
