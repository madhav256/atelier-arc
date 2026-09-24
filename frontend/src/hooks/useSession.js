import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useSession() {
  const query = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      try {
        return (await api('/auth/me')).user;
      } catch (err) {
        if (err.status === 401) {
          try {
            return (await api('/auth/refresh', { method: 'POST' })).user;
          } catch {
            return null;
          }
        }
        throw err;
      }
    },
    staleTime: 5 * 60_000,
    retry: false,
  });
  const user = query.data || null;
  return { user, loading: query.isLoading, isStaff: ['admin', 'advisor'].includes(user?.role), isAdmin: user?.role === 'admin' };
}

export function useAuthActions() {
  const qc = useQueryClient();
  const after = (data) => {
    qc.setQueryData(['session'], data.user);
    qc.invalidateQueries({ queryKey: ['cart'] });
    qc.invalidateQueries({ queryKey: ['collections'] });
  };
  return {
    login: useMutation({ mutationFn: (body) => api('/auth/login', { body }), onSuccess: after }),
    register: useMutation({ mutationFn: (body) => api('/auth/register', { body }), onSuccess: after }),
    googleLogin: useMutation({ mutationFn: (body) => api('/auth/google', { body }), onSuccess: after }),
    logout: useMutation({
      mutationFn: () => api('/auth/logout', { method: 'POST' }),
      onSettled: () => {
        qc.setQueryData(['session'], null);
        qc.removeQueries({ predicate: (q) => ['cart', 'collections', 'notifications', 'me'].includes(q.queryKey[0]) });
      },
    }),
  };
}
