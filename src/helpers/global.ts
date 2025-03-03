import { Role, RoleTranslation } from "@/types";

export const roleTranslation = (role?: Role): RoleTranslation => {
  switch (role) {
    case Role.collaborator:
      return RoleTranslation.collaborator;
    case Role.teamLeader:
      return RoleTranslation.teamLeader;

    default:
      return RoleTranslation.collaborator;
  }
};
