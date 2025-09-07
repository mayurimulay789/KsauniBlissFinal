import { useEffect, useState, lazy, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import { initializeAuth, setFirebaseUser, logout } from "./store/slices/authSlice";
import NetworkStatus from "./components/NetworkStatus";
import { validateEnvironment, debugEnvironment } from "./utils/envValidation";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import ToastProvider from "./components/ToastProvider";
import "./App.css";
const Preloader = lazy(() => import("./components/Preloader"));
const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const MyOrdersPage = lazy(() => import("./pages/MyOrdersPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const OrderDetailsPage = lazy(() => import("./pages/OrderDetailsPage"));
const OrderConfirmationPage = lazy(() => import("./pages/OrderConfirmationPage"));
const AboutUsPage = lazy(() => import("./pages/Aboutus"));
const ContactUsPage = lazy(() => import("./pages/ContactUsPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const CookiesPage = lazy(() => import("./pages/CookiesPage"));
const ReturnPage = lazy(() => import("./pages/ReturnPage"));
const ShippingPage = lazy(() => import("./pages/ShippingPage"));
const SearchResultsPage = lazy(() => import("./pages/SearchResultPage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const DigitalMarketerDashboard = lazy(() => import("./pages/digitalmarketer/DigitalMarketerDashboard"));
function AppContent() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { initialized } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const isCartPage = location.pathname === "/cart";
  const isCheckoutPage = location.pathname === "/checkout";
  const hideNavFooter = isCartPage || isCheckoutPage;
  useEffect(() => {
    document.body.classList.add("preloader-active");
    const isValidEnvironment = validateEnvironment();
    if (!isValidEnvironment) {
      console.error("❌ Application cannot start due to missing environment variables");
      return;
    }
    if (import.meta.env.MODE === "development") {
      debugEnvironment();
    }

    // Initialize auth state from localStorage first
    const tokenExpiry = localStorage.getItem("tokenExpiry");
    const isTokenValid = tokenExpiry && new Date(tokenExpiry) > new Date();

    if (isTokenValid) {
      dispatch(initializeAuth());
    }

    // Then listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Get fresh ID token to ensure it's valid
          const idToken = await firebaseUser.getIdToken(true);
          if (idToken) {
            dispatch(
              setFirebaseUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                phoneNumber: firebaseUser.phoneNumber,
                displayName: firebaseUser.displayName,
                emailVerified: firebaseUser.emailVerified,
                photoURL: firebaseUser.photoURL,
              }),
            );
            
            // Set new expiry date (2 months from now)
            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + 2);
            localStorage.setItem("tokenExpiry", expiryDate.toISOString());
          }
        } else {
          // Only logout if token is expired or missing
          const tokenExpiry = localStorage.getItem("tokenExpiry");
          const isTokenValid = tokenExpiry && new Date(tokenExpiry) > new Date();
          
          if (!isTokenValid) {
            dispatch(logout());
          }
          // Otherwise, let initializeAuth handle restoring state
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        // Clear auth state on error
        dispatch(logout());
      }
    });
    return () => {
      unsubscribe();
      document.body.classList.remove("preloader-active");
    };
  }, [dispatch]);
  const handlePreloaderComplete = () => {
    setIsLoading(false);
    requestAnimationFrame(() => {
      setShowContent(true);
      document.body.classList.remove("preloader-active");
    });
  };
  if (isLoading || !initialized) {
    return (
      <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-white">Loading...</div>}>
        <Preloader onComplete={handlePreloaderComplete} />
      </Suspense>
    );
  }
  return (
    <div className={`App transition-opacity duration-500 ${showContent ? "opacity-100" : "opacity-0"}`}>
      <ToastProvider />
      <NetworkStatus />
      <main className="pt-2 pb-16 md:pb-2 main-content">
        {!hideNavFooter && <Navbar />}
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[200px] py-10">
            <div className="w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:category" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/contact" element={<ContactUsPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/cookies" element={<CookiesPage />} />
            <Route path="/returns" element={<ReturnPage />} />
            <Route path="/shipping" element={<ShippingPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/orders" element={<MyOrdersPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
            <Route path="/order/:orderId" element={<OrderDetailsPage />} />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/digitalMarketer/*"
              element={
                <ProtectedRoute digitalMarketerOnly={true}>
                  <DigitalMarketerDashboard />
                </ProtectedRoute>
              }
            />
            {/* 404 */}
            <Route
              path="*"
              element={
                <div className="flex items-center justify-center min-h-screen bg-gray-50">
                  <div className="p-8 text-center bg-white shadow-lg rounded-2xl">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-500 rounded-full">
                      <span className="text-2xl font-bold text-white">404</span>
                    </div>
                    <h1 className="mb-2 text-2xl font-bold text-gray-800">Page Not Found</h1>
                    <p className="mb-4 text-gray-600">The page you&apos;re looking for doesn&apos;t exist.</p>
                    <a
                      href="/"
                      className="inline-block px-6 py-2 text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
                    >
                      ← Back to Home
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </main>
      {!hideNavFooter && <Footer />}
    </div>
  );
}
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
export default App;