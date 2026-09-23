import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useSession } from './useSession';
import { useStore } from '../store';

// Signed-in collectors save to the server; guests save locally until they sign in.
export function useCollection() {
  const { user } = useSession();
  const qc = useQueryClient();
  const local = useStore((s) => s.collection);
  const toggleLocal = useStore((s) => s.toggleCollection);
  const query = useQuery({ queryKey: ['collections'], queryFn: () => api('/me/collections'), enabled: Boolean(user) });
  const lists = query.data || [];
  const primary = lists[0];
  const savedIds = new Set(lists.flatMap((l) => l.items.map((i) => String(i.artwork?._id || i.artwork))));
  const toggle = useMutation({
    mutationFn: async (artwork) => {
      if (!user) return toggleLocal(artwork);
      const saved = savedIds.has(String(artwork._id));
      return saved
        ? api(`/me/collections/${primary._id}/items/${artwork._id}`, { method: 'DELETE' })
        : api(`/me/collections/${primary._id}/items`, { body: { artworkId: artwork._id } });
    },
    onSuccess: () => user && qc.invalidateQueries({ queryKey: ['collections'] }),
  });
  const isSaved = (artwork) => (user ? savedIds.has(String(artwork._id)) : local.some((x) => x.slug === artwork.slug));
  const count = user ? savedIds.size : local.length;
  return { user, lists, local, isSaved, toggle, count, loading: query.isLoading };
}
