import { create } from 'zustand';
import { MenuStateType } from '../includes/Process.interface';

export const useMenuStore = create<MenuStateType>((set) => ({
    open: true,
    toggle: () => set((state) => ({ open: !state.open })),
}));
