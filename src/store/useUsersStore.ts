import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  type: 'student' | 'business' | 'professional';
}

interface UsersStore {
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  findUser: (email: string, password: string) => User | undefined;
}

export const useUsersStore = create<UsersStore>()(
  persist(
    (set, get) => ({
      users: [],
      addUser: (userData) => set((state) => ({
        users: [...state.users, { ...userData, id: `user-${Date.now()}` }]
      })),
      findUser: (email, password) => {
        const { users } = get();
        return users.find(user => user.email === email && user.password === password);
      }
    }),
    {
      name: 'users-storage',
    }
  )
); 