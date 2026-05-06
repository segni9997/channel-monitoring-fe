export const Role = {
  super_admin: "superAdmin",
  admin: "admin",
  pms_offcier: "officer",
  epayment_officer: "pms",
} as const;

export type Role = (typeof Role)[keyof typeof Role];
export const Channel = {
  MOBILE_BANKING: "MOBILE_BANKING",
  ATM: "ATM",
  POS: "POS",
  INTERNET_BANKING: "INTERNET_BANKING",
  USSD: "USSD",
  APP:"APP",
} as const;

export type Channel = string;

export interface AppChannel {
  id: string;
  name: string;
}

export const Status = {
  PENDING: "inProgress",
  COMPLETED: "completed",
} as const;

export type Status = (typeof Status)[keyof typeof Status];

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  role: Role;
  is_active?: boolean;
  password?: string; // Optional for mock authentication
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface Reason {
  id: string;
  name: string;
  departmentId: string;
  channel: Channel;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
}

export interface ATM {
  id: string;
  name: string;
  terminalId: string;
  branchId: string;
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
  downTimeEnd?:string;
  downTimeStart?:string;
  branchId?: string;
  atmIds?: string[];
}
