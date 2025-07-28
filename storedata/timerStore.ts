import { create } from "zustand";

type TimerStore = {
  timer: number;
  setTimer: (time: number | ((prev: number) => number)) => void;
};

export const useTimerStore = create<TimerStore>((set, get) => ({
  timer: 60, // starting time
  setTimer: (timeOrUpdater) => {
    const newTime = typeof timeOrUpdater === "function"
      ? timeOrUpdater(get().timer)
      : timeOrUpdater;
    console.log("⏱ Timer updated to:", newTime);
    set({ timer: newTime });
  },
}));
