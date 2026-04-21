export const Role = {
  super_admin: "super_admin",
  admin: "admin",
  pms_offcier: "pms_offcier",
  epayment_officer: "epayment_officer",
} as const;

export type Role = (typeof Role)[keyof typeof Role];
export const Channel = {
  MOBILE_BANKING: "MOBILE_BANKING",
  ATM: "ATM",
  POS: "POS",
  INTERNET_BANKING: "INTERNET_BANKING",
  USSD: "USSD",
} as const;

export type Channel = (typeof Channel)[keyof typeof Channel];

export const Status = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
} as const;

export type Status = (typeof Status)[keyof typeof Status];

export interface User {

  password?: string; // Added password for mock authentication
 id: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    role: Role;
    created_at: string;
    updated_at: string;
}

export interface Reason {
  id: string;
  description: string;
}

export interface Incident {
  id: string;
  downtimeStart: string; // ISO String
  downtimeEnd?: string; // ISO String
  duration?: number; // in minutes
  remark: string;
  channel: Channel;
  reasonId: string;
  createdBy: string;
  status: Status;
}
