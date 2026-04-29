import { Channel, type Incident, Status, type Reason, type Branch, type ATM, type Department } from "../types";
import { subDays, subHours, addHours } from "date-fns";


export const MOCK_DEPARTMENTS: Department[] = [
  { id: "dept_1", name: "Digital Banking" },
  { id: "dept_2", name: "DFS" },
  { id: "dept_3", name: "Network Infrastructure" },
  { id: "dept_4", name: "Security" },
];

export const MOCK_REASONS: Reason[] = [
  { id: "rsn_001", name: "Network switch failure", departmentId: "dept_3", channel: Channel.ATM },
  { id: "rsn_002", name: "API gateway crash", departmentId: "dept_1", channel: Channel.MOBILE_BANKING },
  { id: "rsn_003", name: "POS gateway timeout", departmentId: "dept_2", channel: Channel.POS },
  { id: "rsn_004", name: "Database timeout", departmentId: "dept_3", channel: Channel.MOBILE_BANKING },
];

export const MOCK_BRANCHES: Branch[] = [
  { id: "br_1", name: "Main Branch", code: "001" },
  { id: "br_2", name: "Bole Branch", code: "002" },
  { id: "br_3", name: "Kazanchis Branch", code: "003" },
];

export const MOCK_ATMS: ATM[] = [
  { id: "atm_1", name: "Main Lobby ATM 1", terminalId: "T001", branchId: "br_1" },
  { id: "atm_2", name: "Main Lobby ATM 2", terminalId: "T002", branchId: "br_1" },
  { id: "atm_3", name: "Bole Road ATM", terminalId: "T003", branchId: "br_2" },
  { id: "atm_4", name: "Kazanchis Square ATM", terminalId: "T004", branchId: "br_3" },
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
