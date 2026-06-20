import { create } from "zustand";

interface TrainingFilterState {
  pageSize: number;
  startDate?: Date;
  endDate?: Date;
}
interface TrainingFilterActions {
  setStartDate: (date?: Date) => void;
  setEndDate: (date?: Date) => void;
  resetFilter: () => void;
}

const useTrainingFilterStore = create<
  TrainingFilterState & TrainingFilterActions
>((set) => ({
  pageSize: 1,
  startDate: undefined,
  endDate: undefined,
  setStartDate: (date) => set({ startDate: date }),
  setEndDate: (date) => set({ endDate: date }),
  resetFilter: () =>
    set({ startDate: undefined, endDate: undefined, pageSize: 1 }),
}));

export default useTrainingFilterStore;
