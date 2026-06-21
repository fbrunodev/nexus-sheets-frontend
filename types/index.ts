// ─── AUTH ─────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  role: "ADMIN" | "SUPERVISOR" | "OPERADOR" | "USER";
  is_active: boolean;
  plan_type: "LIFETIME" | "MONTHLY" | "TRIAL" | null;
  plan_expires_at: string | null;
  created_at: string;
  last_login: string | null;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
  user: User;
}
// -------Platforms--------------------------------------------
export interface Platform{
  id: string;
  name: string;
  created_at: string;
}
// ─── SHEETS ───────────────────────────────────────────────────

export type SheetStatus = "NOT_STARTED" | "IN_PROGRESS" | "FINISHED";

export interface SheetLine {
  id: string;
  sheet_id: string;
  line_number: number;
  deposit: number;
  withdrawal: number;
  chest: number;
  result: number;
  created_at: string;
}

export interface Sheet {
  id: string;
  name: string;
  owner_id: string;
  operator_id: string | null;
  platform_id: string | null;
  status: SheetStatus;
  salary: number;
  goal: number;
  created_at: string;
  updated_at: string;
  lines: SheetLine[];
}

// ─── DASHBOARD ────────────────────────────────────────────────

export interface CostSummary {
  proxy: number;
  sms: number;
  bot: number;
  fintech: number;
  total: number;
}

export interface MonthlyPerformance {
  month: string;
  deposited: number;
  received: number;
  result: number;
}

export interface DashboardData {
  total_deposited: number;
  total_received: number;
  total_chest: number;
  final_result: number;
  costs: CostSummary;
  total_sheets: number;
  total_operations: number;
  monthly_performance: MonthlyPerformance[];
}

// ─── OPERATORS ────────────────────────────────────────────────

export interface Operator {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}