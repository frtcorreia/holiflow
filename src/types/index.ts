import { Timestamp } from "firebase/firestore";

export enum Role {
  teamLeader = "team_leader",
  collaborator = "collaborator",
  admin = "admin",
}

export enum RoleTranslation {
  teamLeader = "Team Leader",
  collaborator = "Colaborador",
  admin = "Admin",
}

export interface Invitation {
  email?: string | null;
  joinedAt?: string;
  role?: string;
  teamId?: string;
  teamName?: string;
}
export interface User {
  id?: string;
  email?: string | null;
  firstName?: string;
  lastName?: string;
  color?: string;
  role?: Role;
  teamId?: string;
}

export interface Team {
  id: string;
  name?: string;
  leaderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id?: string;
  teamId?: string;
  userId?: string;
  role?: Role;
  joinedAt?: string;
}

export enum InvitationStatus {
  pending = "pending",
  accepted = "accepted",
  rejected = "rejected",
  expired = "expired",
}

export interface TeamInvitation {
  id: string;
  email: string;
  teamId: string;
  teamName: string;
  status: InvitationStatus;
  createdAt: string;
  expiresAt: string;
}

export enum AbsenceType {
  vacation = "ferias",
  holiday = "feriado_local",
  leave = "licenca",
}
export enum VacationsStatus {
  pending = "pending",
  approved = "approved",
  rejected = "rejected",
}
export interface VacationPeriod {
  id?: string;
  teamLeaderId?: string;
  userId?: string;
  userName?: string;
  startDate?: string;
  endDate?: string;
  type?: AbsenceType;
  createdAt?: string;
  updatedAt?: string;
  status?: VacationsStatus;
}

export enum HolidayType {
  national = "nacional",
  local = "local",
}

export interface Holiday {
  date: string;
  name: string;
  type: HolidayType;
}

export enum NotificationType {
  vacation_request = "vacation_request",
  vacation_approved = "vacation_approved",
  vacation_rejected = "vacation_rejected",
  team_invite = "team_invite",
  team_joined = "team_joined",
}

export interface Notification {
  id: string;
  userId?: string;
  email?: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: Timestamp;
  metadata?: {
    vacationId?: string;
    teamId?: string;
    invitationId?: string;
  };
}

export enum VacationsTagColor {
  pending = "bg-yellow-100 text-yellow-800",
  approved = "bg-green-100 text-green-800",
  rejected = "bg-red-100 text-red-800",
}

export enum VacationsTagText {
  pending = "Pendente",
  approved = "Aprovado",
  rejected = "Rejeitado",
}
