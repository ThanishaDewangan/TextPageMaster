import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Product {
  id: number;
  name: string;
  quantity: number;
  rate: string;
  total: string;
  gst: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

interface ProductState {
  products: Product[];
  selectedProducts: number[];
  addProduct: (product: Product) => void;
  removeProduct: (id: number) => void;
  toggleProductSelection: (id: number) => void;
  clearProducts: () => void;
  setProducts: (products: Product[]) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (token, user) =>
        set({ token, user, isAuthenticated: true }),
      logout: () =>
        set({ token: null, user: null, isAuthenticated: false }),
      setUser: (user) =>
        set({ user }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const useProductStore = create<ProductState>()((set) => ({
  products: [],
  selectedProducts: [],
  addProduct: (product) =>
    set((state) => ({
      products: [...state.products, product],
    })),
  removeProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
      selectedProducts: state.selectedProducts.filter((pid) => pid !== id),
    })),
  toggleProductSelection: (id) =>
    set((state) => ({
      selectedProducts: state.selectedProducts.includes(id)
        ? state.selectedProducts.filter((pid) => pid !== id)
        : [...state.selectedProducts, id],
    })),
  clearProducts: () =>
    set({ products: [], selectedProducts: [] }),
  setProducts: (products) =>
    set({ products }),
}));
