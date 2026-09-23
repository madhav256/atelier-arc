import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Link } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Loading } from './components/States';
import { useDocumentMeta } from './hooks/useDocumentMeta';

const named = (loader, name) => lazy(() => loader().then((m) => ({ default: m[name] })));
const authPages = () => import('./pages/Auth');
const accountPages = () => import('./pages/Account');
const adminPages = () => import('./pages/Admin');

const Home = lazy(() => import('./pages/Home'));
const Catalog = lazy(() => import('./pages/Catalog'));
const Artwork = lazy(() => import('./pages/ArtworkDetail'));
const MyCollection = lazy(() => import('./pages/MyCollection'));
const SharedCollection = named(() => import('./pages/MyCollection'), 'SharedCollection');
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const CheckoutComplete = lazy(() => import('./pages/CheckoutComplete'));
const Artists = lazy(() => import('./pages/Artists'));
const Artist = lazy(() => import('./pages/ArtistDetail'));
const Journal = lazy(() => import('./pages/Journal'));
const JournalStory = named(() => import('./pages/Journal'), 'JournalStory');
const Collections = lazy(() => import('./pages/Collections'));
const CollectionDetail = named(() => import('./pages/Collections'), 'CollectionDetail');
const Advisory = lazy(() => import('./pages/Advisory'));
const Auth = lazy(authPages);
const ForgotPassword = named(authPages, 'ForgotPassword');
const ResetPassword = named(authPages, 'ResetPassword');
const VerifyEmail = named(authPages, 'VerifyEmail');
const OrderStatus = named(authPages, 'OrderStatus');
const AccountLayout = named(accountPages, 'AccountLayout');
const AccountOverview = named(accountPages, 'AccountOverview');
const AccountOrders = named(accountPages, 'AccountOrders');
const AccountOrder = named(accountPages, 'AccountOrder');
const AccountInquiries = named(accountPages, 'AccountInquiries');
const AccountInquiry = named(accountPages, 'AccountInquiry');
const AccountNotifications = named(accountPages, 'AccountNotifications');
const AccountRecommendations = named(accountPages, 'AccountRecommendations');
const AccountSettings = named(accountPages, 'AccountSettings');
const Admin = lazy(adminPages);

function NotFound() {
  useDocumentMeta('Page not found', undefined, { noindex: true });
  return (
    <section className="plain-page">
      <span className="eyebrow">404</span>
      <h1>This room is empty.</h1>
      <p className="lede">The page you were looking for has moved or no longer exists.</p>
      <p>
        <Link className="button" to="/artworks">
          Explore the collection
        </Link>
      </p>
    </section>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/artworks', element: <Catalog /> },
      { path: '/artworks/:slug', element: <Artwork /> },
      { path: '/artists', element: <Artists /> },
      { path: '/artists/:slug', element: <Artist /> },
      { path: '/collections', element: <Collections /> },
      { path: '/collections/:slug', element: <CollectionDetail /> },
      { path: '/journal', element: <Journal /> },
      { path: '/journal/:slug', element: <JournalStory /> },
      { path: '/advisory', element: <Advisory /> },
      { path: '/my-collection', element: <MyCollection /> },
      { path: '/shared/:token', element: <SharedCollection /> },
      { path: '/cart', element: <Cart /> },
      { path: '/checkout', element: <Checkout /> },
      { path: '/checkout/complete/:number', element: <CheckoutComplete /> },
      { path: '/order-status', element: <OrderStatus /> },
      { path: '/login', element: <Auth mode="login" /> },
      { path: '/register', element: <Auth mode="register" /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
      { path: '/reset-password', element: <ResetPassword /> },
      { path: '/verify-email', element: <VerifyEmail /> },
      {
        path: '/account',
        element: <AccountLayout />,
        children: [
          { index: true, element: <AccountOverview /> },
          { path: 'orders', element: <AccountOrders /> },
          { path: 'orders/:number', element: <AccountOrder /> },
          { path: 'inquiries', element: <AccountInquiries /> },
          { path: 'inquiries/:id', element: <AccountInquiry /> },
          { path: 'notifications', element: <AccountNotifications /> },
          { path: 'recommendations', element: <AccountRecommendations /> },
          { path: 'settings', element: <AccountSettings /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
  { path: '/admin/*', element: <Admin /> },
]);

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
