export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  lastSeenAt: string;
  status: UserStatus;
}

export interface UsersResponse {
  content: UserDTO[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface GetUsersParams {
  page: number;
  size: number;
  status?: UserStatus;
  search?: string;
}
