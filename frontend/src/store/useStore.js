import { create } from 'zustand';

const useStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null });
  },

  boards: [],
  setBoards: (boards) => set({ boards }),

  activeBoard: null,
  setActiveBoard: (board) => set({ activeBoard: board }),
}));

export default useStore;
