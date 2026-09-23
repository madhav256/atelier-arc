import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useCart() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['cart'], queryFn: () => api('/cart'), staleTime: 30_000 });
  const set = (data) => qc.setQueryData(['cart'], data);
  return {
    cart: query.data || { lines: [], subtotal: 0, count: 0 },
    loading: query.isLoading,
    add: useMutation({ mutationFn: (artworkId) => api('/cart/items', { body: { artworkId } }), onSuccess: set }),
    remove: useMutation({ mutationFn: (artworkId) => api(`/cart/items/${artworkId}`, { method: 'DELETE' }), onSuccess: set }),
    update: useMutation({ mutationFn: ({ artworkId, quantity }) => api(`/cart/items/${artworkId}`, { method: 'PATCH', body: { quantity } }), onSuccess: set }),
  };
}
