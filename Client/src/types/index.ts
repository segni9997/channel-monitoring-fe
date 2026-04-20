export const Role = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  PMS_OFFICER: "PMS_OFFICER",
  EPAYMENT_OFFICER: "EPAYMENT_OFFICER",
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
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string; // Added phone number
  password?: string; // Added password for mock authentication
  role: Role;
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
