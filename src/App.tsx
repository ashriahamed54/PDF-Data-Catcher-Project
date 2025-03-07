
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

// This component will protect routes that require authentication
const ProtectedRoute = ({ children, adminRequired = false }: { children: React.ReactNode, adminRequired?: boolean }) => {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (adminRequired && !isAdmin) {
    return <Navigate to="/home" replace />;
  }
  
  return <>{children}</>;
};

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, isAdmin } = useAuth();
  
  return (
    <Routes>
      <Route 
        path="/home" 
        element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute adminRequired={true}>
            <Admin />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/auth" 
        element={user ? <Navigate to={isAdmin ? "/admin" : "/home"} replace /> : <Auth />} 
      />
      <Route path="/" element={<Navigate to={user ? (isAdmin ? "/admin" : "/home") : "/auth"} replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
