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
import { startCursor } from "../lib/cursor";
import { EnterGate } from "./EnterGate";

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
  useEffect(() => startCursor(), []);
  useEffect(() => {
    setOpen(false);
    scrollToTop();
    return pageEnter(curtainRef.current, mainRef.current);
  }, [location.pathname]);
  const unreadCount = unread.data?.unread || 0;
  return (
    <>
      <EnterGate />
      <header className="site-header">
        <Link className="brand" to="/" aria-label="Atelier Arc home">
          <img className="brand-img" src="data:image/png;base64,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pAOCDD2AlJXo2/TILa9B9p9qYkJI+VBv/qjGQ3n0ziErBEGQYSNUhpVWXN6z4dukhSB16xJFfkNVsu+m+gWq/KGAR5ABIx114R+X/k1Wph8+OFQ6B6lXYvKxpYhqDJH23uh6V2i9CZvgqYsIMmA7RuYinlTcEyvNYsNxVFhu6KXZDgn7dYu+jz3+VH7n1NjVm0yZqUR9E3tq3AqdqqQMEGQ4CdZyWb0e3Wz4fLCWSpSs9E1SY9NKlBc62aa21r7PUrix3hr3b5wCBBkq95Hnm0W7olwQc91fbvenzfv62Heyn36SxYRM6iXySoIS3dLMiGW8cl1xMxJTvb36F5b5IsigSZQgN8/fvrlClv5t6N4Y3GdbkHB68838dO9dE70dju865VlTanZUd/Wiekffzu6axzxwJxWCfKCCpqncMf+Zh+EskBtpAEEGHUPWhoqeOlmvy/5+89PD5buyfr68UNanLD9BEDiUJNEgB4IAIAgAggAgCACCACAIAIIAAIIAIAgAggAgCACCACAIAIIAIAgAggAgCAAgCACCACAIAIIAIAgAggAgCACCACAIACAIAIIAIAgAggAgCACCACAIAIIAIAgAggAAggAgCACCACAIAIIAIAgAggAgCACCAACCACAIAIIAIAgAggAgCACCACAIAIIAIAgAIAgAggAgCACCACAIAIIAIAgAggAgCACCAACCACAIAIIAIAgAggAgCACCACAIAIIAAIIAIAgAggAgCACCACAIAIIAIAgAggAgCAAgCACCACAIAIIAIAgAggAgCACCACAIACAIAIIAIAgAggAgCACCACAIAIIAIAgAggAAggAgCACCACAIAIIAIAgAggBcGv8PuLuyluy38yUAAAAASUVORK5CYII=" alt="" />
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
          <small>
              <Link to="/privacy">Privacy</Link> ·{" "}
              <Link to="/terms">Terms</Link>
            </small>
        </div>
      </footer>
    </>
  );
}
