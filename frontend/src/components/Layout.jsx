import { TasteInvite } from "./TasteInvite";
import { Loading } from "./States";
import { Suspense } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, Search, Heart, ShoppingBag, X, Bell, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  pageEnter,
  scrollToTop,
  startSmoothScroll,
  watchReveals,
} from "../lib/motion";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "../hooks/useCart";
import { useCollection } from "../hooks/useCollection";
import { useSession } from "../hooks/useSession";
import { api } from "../lib/api";

export function Layout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { cart } = useCart();
  const { count } = useCollection();
  const { user, isStaff } = useSession();
  const unread = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: () => api("/me/notifications/unread-count"),
    enabled: Boolean(user),
    refetchInterval: 60_000,
  });
  const mainRef = useRef(null);
  const curtainRef = useRef(null);
  useEffect(() => startSmoothScroll(), []);
  useEffect(() => watchReveals(mainRef.current), []);
  useEffect(() => {
    setOpen(false);
    scrollToTop();
    return pageEnter(curtainRef.current, mainRef.current);
  }, [location.pathname]);
  const unreadCount = unread.data?.unread || 0;
  return (
    <>
      <header className="site-header">
        <Link className="brand" to="/" aria-label="Atelier Arc home">
          <span>ATELIER</span>
          <i>ARC</i>
        </Link>
        <button
          className={open ? "nav-scrim show" : "nav-scrim"}
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
          tabIndex={-1}
        />
        <nav
          className={open ? "open" : ""}
          aria-label="Primary"
          id="primary-nav"
        >
          <NavLink to="/artworks">Artworks</NavLink>
          <NavLink to="/artists">Artists</NavLink>
          <NavLink to="/collections">Collections</NavLink>
          <NavLink to="/journal">Journal</NavLink>
          <NavLink to="/advisory">Private advisory</NavLink>
          {isStaff && <NavLink to="/admin">Gallery admin</NavLink>}
          <button
            className="nav-close"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <X />
          </button>
        </nav>
        <div className="header-tools">
          <Link to="/artworks?focus=search" aria-label="Search artworks">
            <Search />
          </Link>
          {user && (
            <Link
              to="/account/notifications"
              aria-label={`Notifications, ${unreadCount} unread`}
            >
              <Bell />
              <b>{unreadCount || ""}</b>
            </Link>
          )}
          <Link
            to="/my-collection"
            aria-label={`My Collection, ${count} works`}
          >
            <Heart />
            <b>{count || ""}</b>
          </Link>
          <Link to="/cart" aria-label={`Acquisition bag, ${cart.count} works`}>
            <ShoppingBag />
            <b>{cart.count || ""}</b>
          </Link>
          <Link
            to={user ? "/account" : "/login"}
            aria-label={user ? "Your account" : "Sign in"}
          >
            <User />
          </Link>
          <button
            className="menu"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            aria-expanded={open}
            aria-controls="primary-nav"
          >
            <Menu />
          </button>
        </div>
      </header>
      <div className="page-curtain" ref={curtainRef} aria-hidden="true" />
      <main id="main" tabIndex={-1} ref={mainRef}>
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </main>
      <TasteInvite />
      <footer className="site-footer">
        <div className="footer-top">
          <p className="footer-statement">
            Art that changes <em>the room.</em>
          </p>
          <div className="footer-cols">
            <div>
              <h3>
                <i>01</i> Visit
              </h3>
              <p>
                By appointment
                <br />
                Mumbai · New Delhi
              </p>
            </div>
            <div>
              <h3>
                <i>02</i> Explore
              </h3>
              <Link to="/artworks">Artworks</Link>
              <Link to="/artists">Artists</Link>
              <Link to="/collections">Collections</Link>
              <Link to="/journal">Journal</Link>
            </div>
            <div>
              <h3>
                <i>03</i> Collectors
              </h3>
              <Link to="/advisory">Private advisory</Link>
              <Link to="/my-collection">My Collection</Link>
              <Link to="/order-status">Order status</Link>
              <Link to="/guarantee">Returns and guarantee</Link>
              <Link to="/verify">Verify a certificate</Link>
            </div>
          </div>
        </div>
        <p className="footer-wordmark" aria-hidden="true">
          Atelier <em>Arc</em>
        </p>
        <div className="footer-meta">
          <small>© {new Date().getFullYear()} Atelier Arc</small>
          <small>Original contemporary art · Est. Mumbai</small>
          <small>Privacy · Terms</small>
        </div>
      </footer>
    </>
  );
}
