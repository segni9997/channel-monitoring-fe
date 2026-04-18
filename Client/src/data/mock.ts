import { Channel, Role, type Incident, Status, type User, type Reason } from "../types";
import { subDays, subHours, addHours } from "date-fns";

export const MOCK_USERS: User[] = [
  {
    id: "usr_1",
    firstName: "Segni",
    lastName: "Asrat",
    email: "segni.asrat@berhanbank.com",
    phone: "+251911000001",
    role: Role.ADMIN,
  },
  {
    id: "usr_2",
    firstName: "PMS",
    lastName: "Analyst",
    email: "pms.analyst@berhanbank.com",
    phone: "+251911000002",
    role: Role.PMS_OFFICER,
  },
  {
    id: "usr_3",
    firstName: "Epayment",
    lastName: "Specialist",
    email: "epayment.specialist@berhanbank.com",
    phone: "+251911000003",
    role: Role.EPAYMENT_OFFICER,
  },
];

export const MOCK_REASONS: Reason[] = [
  { id: "rsn_001", description: "Network switch failure" },
  { id: "rsn_002", description: "API gateway crash" },
  { id: "rsn_003", description: "POS gateway timeout" },
  { id: "rsn_004", description: "Database timeout" },
];

// Seed some data around today
const now = new Date();
const _1weekAgo = subDays(now, 7);
const _2monthsAgo = subDays(now, 60);

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: "inc_001",
    downtimeStart: subHours(now, 5).toISOString(),
    downtimeEnd: subHours(now, 4).toISOString(),
    duration: 60,
    remark: "Network switch failure",
    channel: Channel.ATM,
    reasonId: "rsn_001",
    createdBy: "usr_3",
    status: Status.COMPLETED,
  },
  {
    id: "inc_005",
    downtimeStart: subHours(now, 5).toISOString(),
    downtimeEnd: subHours(now, 4).toISOString(),
    duration: 60,
    remark: "Network switch failure",
    channel: Channel.ATM,
    reasonId: "rsn_001",
    createdBy: "usr_3",
    status: Status.COMPLETED,
  },
  {
    id: "inc_002",
    downtimeStart: subHours(now, 26).toISOString(),
    downtimeEnd: subHours(now, 3).toISOString(), // Rollover case visually if just looking at clock, though ISO strings correctly show differences.
    duration: 1380,
    remark: "Database timeout",
    channel: Channel.MOBILE_BANKING,
    reasonId: "rsn_004",
    createdBy: "usr_3",
    status: Status.PENDING,
  },
  // Weekly data
  {
    id: "inc_003",
    downtimeStart: _1weekAgo.toISOString(),
    downtimeEnd: addHours(_1weekAgo, 2).toISOString(),
    duration: 120,
    remark: "API gateway crash",
    channel: Channel.INTERNET_BANKING,
    reasonId: "rsn_002",
    createdBy: "usr_3",
    status: Status.COMPLETED,
  },
  // Monthly data
  {
    id: "inc_004",
    downtimeStart: _2monthsAgo.toISOString(),
    downtimeEnd: addHours(_2monthsAgo, 1).toISOString(),
    duration: 60,
    remark: "POS gateway timeout",
    channel: Channel.POS,
    reasonId: "rsn_003",
    createdBy: "usr_3",
    status: Status.COMPLETED,
  },
];
