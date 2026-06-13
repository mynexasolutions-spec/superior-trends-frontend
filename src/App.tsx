import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ReactLenis } from 'lenis/react';
import { ShopProvider } from './context/ShopContext';
import { ToastProvider } from './components/ui/Toast';
import { StorefrontShell } from './components/StorefrontShell';
import { PageLoader } from './components/PageLoader';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/useAuthStore';
import { useOrderSocket } from './hooks/useOrderSocket';
import { CATALOG_GC_MS, CATALOG_STALE_MS } from './lib/queryConfig';
import { LanguageProvider } from './context/LanguageContext';

const Home = lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })));
const Shop = lazy(() => import('./pages/Shop').then((m) => ({ default: m.Shop })));
const ProductDetail = lazy(() => import('./pages/ProductDetail').then((m) => ({ default: m.ProductDetail })));
const Wishlist = lazy(() => import('./pages/Wishlist').then((m) => ({ default: m.Wishlist })));
const Checkout = lazy(() => import('./pages/Checkout').then((m) => ({ default: m.Checkout })));
const Auth = lazy(() => import('./pages/Auth').then((m) => ({ default: m.Auth })));
const About = lazy(() => import('./pages/About').then((m) => ({ default: m.About })));
const Contact = lazy(() => import('./pages/Contact').then((m) => ({ default: m.Contact })));
const Blogs = lazy(() => import('./pages/Blogs').then((m) => ({ default: m.Blogs })));
const BlogDetail = lazy(() => import('./pages/BlogDetail').then((m) => ({ default: m.BlogDetail })));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts').then((m) => ({ default: m.AdminProducts })));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories').then((m) => ({ default: m.AdminCategories })));
const AdminSections = lazy(() => import('./pages/admin/AdminSections').then((m) => ({ default: m.AdminSections })));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders').then((m) => ({ default: m.AdminOrders })));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews').then((m) => ({ default: m.AdminReviews })));
const AdminBlogs = lazy(() => import('./pages/admin/AdminBlogs').then((m) => ({ default: m.AdminBlogs })));
const AdminBlogCategories = lazy(() => import('./pages/admin/AdminBlogCategories').then((m) => ({ default: m.AdminBlogCategories })));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons').then((m) => ({ default: m.AdminCoupons })));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings').then((m) => ({ default: m.AdminSettings })));
const AdminContact = lazy(() => import('./pages/admin/AdminContact').then((m) => ({ default: m.AdminContact })));
const MyOrders = lazy(() => import('./pages/MyOrders').then((m) => ({ default: m.MyOrders })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: CATALOG_STALE_MS,
      gcTime: CATALOG_GC_MS,
    },
  },
});

function AppBootstrap() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  useOrderSocket();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppBootstrap />
      <ReactLenis root>
        <LanguageProvider>
          <ShopProvider>
            <ToastProvider>
            <Router>
              <div className="flex flex-col min-h-screen bg-brand-cream text-brand-charcoal ">
                <StorefrontShell>
                  <main className="flex-grow w-full min-w-0 ">
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/product/:id" element={<ProductDetail />} />
                        <Route path="/wishlist" element={<Wishlist />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/orders" element={<MyOrders />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/blogs" element={<Blogs />} />
                        <Route path="/blogs/:slug" element={<BlogDetail />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/auth" element={<Auth />} />

                        <Route path="/admin" element={<AdminLayout />}>
                          <Route index element={<AdminDashboard />} />
                          <Route path="products" element={<AdminProducts />} />
                          <Route path="categories" element={<AdminCategories />} />
                          <Route path="sections" element={<AdminSections />} />
                          <Route path="orders" element={<AdminOrders />} />
                          <Route path="reviews" element={<AdminReviews />} />
                          <Route path="blogs" element={<AdminBlogs />} />
                          <Route path="blogs/categories" element={<AdminBlogCategories />} />
                          <Route path="coupons" element={<AdminCoupons />} />
                          <Route path="settings" element={<AdminSettings />} />
                          <Route path="contact" element={<AdminContact />} />
                        </Route>
                      </Routes>
                    </Suspense>
                  </main>
                </StorefrontShell>
              </div>
            </Router>
            </ToastProvider>
          </ShopProvider>
        </LanguageProvider>
      </ReactLenis>
    </QueryClientProvider>
  );
}

export default App;
