import { NavLink, Navigate, Route, Routes, Link, useLocation } from 'react-router-dom';
import { useSession, useAuthActions } from '../hooks/useSession';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { Loading } from '../components/States';
import { ResourceList, ResourceForm } from '../admin/ResourceEditor';
import { Dashboard, OrdersList, OrderAdmin, InquiriesList, InquiryAdmin, AuditLog } from '../admin/Operations';

export default function Admin() {
  const { user, loading, isStaff, isAdmin } = useSession();
  const { logout } = useAuthActions();
  const loc = useLocation();
  useDocumentMeta('Gallery administration', undefined, { noindex: true });
  if (loading) return <Loading />;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname)}`} replace />;
  if (!isStaff)
    return (
      <section className="plain-page">
        <h1>Staff only</h1>
        <p className="lede">This area is for Atelier Arc staff.</p>
        <Link className="button" to="/">
          Return to the gallery
        </Link>
      </section>
    );
  const nav = [
    ...(isAdmin ? [['/admin', 'Overview', true]] : []),
    ['/admin/inquiries', isAdmin ? 'Inquiries' : 'My inquiries'],
    ['/admin/orders', 'Orders'],
    ['/admin/artworks', 'Artworks'],
    ['/admin/artists', 'Artists'],
    ['/admin/collections', 'Collections'],
    ['/admin/articles', 'Journal'],
    ...(isAdmin
      ? [
          ['/admin/customers', 'Customers'],
          ['/admin/audit', 'Audit log'],
        ]
      : []),
  ];
  return (
    <div className="admin-page">
      <a className="skip-link" href="#admin-main">
        Skip to content
      </a>
      <aside>
        <Link to="/" className="brand">
          ATELIER <i>ARC</i>
        </Link>
        <nav aria-label="Administration">
          {nav.map(([to, text, end]) => (
            <NavLink key={to} to={to} end={end}>
              {text}
            </NavLink>
          ))}
        </nav>
        <p className="admin-user">
          {user.name}
          <br />
          <small>{user.role}</small>
          <br />
          <button className="text-button" onClick={() => logout.mutate()}>
            Sign out
          </button>
        </p>
      </aside>
      <main id="admin-main" tabIndex={-1}>
        <Routes>
          <Route index element={isAdmin ? <Dashboard /> : <Navigate to="/admin/inquiries" replace />} />
          <Route path="inquiries" element={<InquiriesList isAdmin={isAdmin} />} />
          <Route path="inquiries/:id" element={<InquiryAdmin isAdmin={isAdmin} />} />
          <Route path="orders" element={<OrdersList />} />
          <Route path="orders/:id" element={<OrderAdmin isAdmin={isAdmin} />} />
          <Route path="audit" element={isAdmin ? <AuditLog /> : <Navigate to="/admin" replace />} />
          <Route path=":resource" element={<ResourceList canWrite={isAdmin} />} />
          <Route path=":resource/:id" element={<ResourceForm canWrite={isAdmin} />} />
        </Routes>
      </main>
    </div>
  );
}
