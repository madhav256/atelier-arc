import { Loading } from './States';
import { Suspense } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, Search, Heart, ShoppingBag, X, Bell, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '../hooks/useCart';
import { useCollection } from '../hooks/useCollection';
import { useSession } from '../hooks/useSession';
import { api } from '../lib/api';

export function Layout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { cart } = useCart();
  const { count } = useCollection();
  const { user, isStaff } = useSession();
  const unread = useQuery({ queryKey: ['notifications', 'unread'], queryFn: () => api('/me/notifications/unread-count'), enabled: Boolean(user), refetchInterval: 60_000 });
  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);
  const unreadCount = unread.data?.unread || 0;
  return (
    <>
      <header className="site-header">
        <Link className="brand" to="/" aria-label="Atelier Arc home">
          <span>ATELIER</span>
          <i>ARC</i>
        </Link>
        <nav className={open ? 'open' : ''} aria-label="Primary" id="primary-nav">
          <NavLink to="/artworks">Artworks</NavLink>
          <NavLink to="/artists">Artists</NavLink>
          <NavLink to="/collections">Collections</NavLink>
          <NavLink to="/journal">Journal</NavLink>
          <NavLink to="/advisory">Private advisory</NavLink>
          {isStaff && <NavLink to="/admin">Gallery admin</NavLink>}
          <button className="nav-close" onClick={() => setOpen(false)} aria-label="Close navigation">
            <X />
          </button>
        </nav>
        <div className="header-tools">
          <Link to="/artworks?focus=search" aria-label="Search artworks">
            <Search />
          </Link>
          {user && (
            <Link to="/account/notifications" aria-label={`Notifications, ${unreadCount} unread`}>
              <Bell />
              <b>{unreadCount || ''}</b>
            </Link>
          )}
          <Link to="/my-collection" aria-label={`My Collection, ${count} works`}>
            <Heart />
            <b>{count || ''}</b>
          </Link>
          <Link to="/cart" aria-label={`Acquisition bag, ${cart.count} works`}>
            <ShoppingBag />
            <b>{cart.count || ''}</b>
          </Link>
          <Link to={user ? '/account' : '/login'} aria-label={user ? 'Your account' : 'Sign in'}>
            <User />
          </Link>
          <button className="menu" onClick={() => setOpen(true)} aria-label="Open navigation" aria-expanded={open} aria-controls="primary-nav">
            <Menu />
          </button>
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </main>
      <footer>
        <div>
          <span className="eyebrow">ATELIER ARC</span>
          <h2>
            Art that changes
            <br />
            the room.
          </h2>
        </div>
        <div>
          <h3>Visit</h3>
          <p>
            By appointment
            <br />
            Mumbai · New Delhi
          </p>
        </div>
        <div>
          <h3>Explore</h3>
          <Link to="/artworks">Artworks</Link>
          <Link to="/journal">Journal</Link>
          <Link to="/advisory">Private advisory</Link>
          <Link to="/order-status">Order status</Link>
        </div>
        <small>© {new Date().getFullYear()} Atelier Arc · Privacy · Terms</small>
      </footer>
    </>
  );
}
