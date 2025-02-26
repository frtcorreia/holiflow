import { VacationsStatus } from "../types";

export const getStatusColor = (status?: VacationsStatus) => {
  switch (status) {
    case VacationsStatus.approved:
      return "bg-green-100 text-green-800";
    case VacationsStatus.rejected:
      return "bg-red-100 text-red-800";
    default:
      return "bg-yellow-100 text-yellow-800";
  }
};

export const getStatusText = (status?: VacationsStatus) => {
  switch (status) {
    case VacationsStatus.approved:
      return "Aprovado";
    case VacationsStatus.rejected:
      return "Rejeitado";
    default:
      return "Pendente";
  }
};
