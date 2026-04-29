import { create } from "zustand";
import { DEPARTMENT_LABEL_TO_ID } from "../data/menu";
import type { DepartmentId } from "../types";

type State = {
  selectedMenuPath: string[] | null;
  selectedDepartmentId: DepartmentId | null;
  hoveredDepartmentId: DepartmentId | null;
  panelOpen: boolean;
  setMenuSelection: (path: string[]) => void;
  setDepartmentSelection: (id: DepartmentId) => void;
  setHoveredDepartment: (id: DepartmentId | null) => void;
  closePanel: () => void;
};

export const useAppStore = create<State>((set) => ({
  selectedMenuPath: ["Department", "Engineering"],
  selectedDepartmentId: "engineering",
  hoveredDepartmentId: null,
  panelOpen: true,
  setMenuSelection: (path) => {
    const next: Partial<State> = { selectedMenuPath: path, panelOpen: true };
    if (path[0] === "Department" && path[1]) {
      const id = DEPARTMENT_LABEL_TO_ID[path[1]] as DepartmentId | undefined;
      if (id) next.selectedDepartmentId = id;
    } else {
      next.selectedDepartmentId = null;
    }
    set(next);
  },
  setDepartmentSelection: (id) => {
    const label = Object.entries(DEPARTMENT_LABEL_TO_ID).find(
      ([, v]) => v === id
    )?.[0];
    set({
      selectedDepartmentId: id,
      selectedMenuPath: label ? ["Department", label] : null,
      panelOpen: true,
    });
  },
  setHoveredDepartment: (id) => set({ hoveredDepartmentId: id }),
  closePanel: () => set({ panelOpen: false, selectedDepartmentId: null }),
}));
