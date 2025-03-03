import {
  Role,
  Team,
  VacationsStatus,
  VacationsTagColor,
  VacationsTagText,
} from "../types";

interface TagSpecsProps {
  getStatusColor: (status?: VacationsStatus) => string;
  getStatusText: (status?: VacationsStatus) => string;
}

export const useTagSpecs = (): TagSpecsProps => {
  const getStatusColor = (status?: VacationsStatus) => {
    switch (status) {
      case VacationsStatus.approved:
        return VacationsTagColor.approved;
      case VacationsStatus.rejected:
        return VacationsTagColor.rejected;
      default:
        return VacationsTagColor.pending;
    }
  };

  const getStatusText = (status?: VacationsStatus) => {
    switch (status) {
      case VacationsStatus.approved:
        return VacationsTagText.approved;
      case VacationsStatus.rejected:
        return VacationsTagText.rejected;
      default:
        return VacationsTagText.pending;
    }
  };

  return { getStatusColor, getStatusText };
};
