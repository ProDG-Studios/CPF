import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { FilterProvider } from "@/contexts/FilterContext";
import { DataProvider } from "@/contexts/DataContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";

// Auth
import AuthPage from "./pages/AuthPage";

// Supplier Portal
import SupplierDashboard from "./pages/supplier/SupplierDashboard";
import SubmitBillPage from "./pages/supplier/SubmitBillPage";
import MyBillsPage from "./pages/supplier/MyBillsPage";
import SupplierProfilePage from "./pages/supplier/SupplierProfilePage";

// SPV Portal
import SPVDashboard from "./pages/spv/SPVDashboard";
import SPVBillsPage from "./pages/spv/SPVBillsPage";
import SPVOffersPage from "./pages/spv/SPVOffersPage";

// MDA Portal
import MDADashboard from "./pages/mda/MDADashboard";
import MDABillsPage from "./pages/mda/MDABillsPage";
import MDAApprovedPage from "./pages/mda/MDAApprovedPage";

// Treasury Portal
import TreasuryDashboard from "./pages/treasury/TreasuryDashboard";
import TreasuryPendingPage from "./pages/treasury/TreasuryPendingPage";
import TreasuryCertifiedPage from "./pages/treasury/TreasuryCertifiedPage";

// Admin (existing pages)
import AppLayout from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import BillsExplorer from "./pages/BillsExplorer";
import WorkflowPage from "./pages/WorkflowPage";
import MDAsPage from "./pages/MDAsPage";
import SuppliersPage from "./pages/SuppliersPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import TimelinePage from "./pages/TimelinePage";
import PaymentSchedulePage from "./pages/PaymentSchedulePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <FilterProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                {/* Auth */}
                <Route path="/auth" element={<AuthPage />} />
                
                {/* Supplier Portal */}
                <Route path="/supplier" element={<ProtectedRoute allowedRoles={['supplier']}><SupplierDashboard /></ProtectedRoute>} />
                <Route path="/supplier/submit-bill" element={<ProtectedRoute allowedRoles={['supplier']}><SubmitBillPage /></ProtectedRoute>} />
                <Route path="/supplier/my-bills" element={<ProtectedRoute allowedRoles={['supplier']}><MyBillsPage /></ProtectedRoute>} />
                <Route path="/supplier/profile" element={<ProtectedRoute allowedRoles={['supplier']}><SupplierProfilePage /></ProtectedRoute>} />

                {/* SPV Portal */}
                <Route path="/spv" element={<ProtectedRoute allowedRoles={['spv']}><SPVDashboard /></ProtectedRoute>} />
                <Route path="/spv/bills" element={<ProtectedRoute allowedRoles={['spv']}><SPVBillsPage /></ProtectedRoute>} />
                <Route path="/spv/offers" element={<ProtectedRoute allowedRoles={['spv']}><SPVOffersPage /></ProtectedRoute>} />

                {/* MDA Portal */}
                <Route path="/mda" element={<ProtectedRoute allowedRoles={['mda']}><MDADashboard /></ProtectedRoute>} />
                <Route path="/mda/bills" element={<ProtectedRoute allowedRoles={['mda']}><MDABillsPage /></ProtectedRoute>} />
                <Route path="/mda/approved" element={<ProtectedRoute allowedRoles={['mda']}><MDAApprovedPage /></ProtectedRoute>} />

                {/* Treasury Portal */}
                <Route path="/treasury" element={<ProtectedRoute allowedRoles={['treasury']}><TreasuryDashboard /></ProtectedRoute>} />
                <Route path="/treasury/pending" element={<ProtectedRoute allowedRoles={['treasury']}><TreasuryPendingPage /></ProtectedRoute>} />
                <Route path="/treasury/certified" element={<ProtectedRoute allowedRoles={['treasury']}><TreasuryCertifiedPage /></ProtectedRoute>} />

                {/* Admin Portal (existing) */}
                <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AppLayout><Index /></AppLayout></ProtectedRoute>} />
                <Route path="/admin/bills" element={<ProtectedRoute allowedRoles={['admin']}><AppLayout><BillsExplorer /></AppLayout></ProtectedRoute>} />
                <Route path="/admin/workflow" element={<ProtectedRoute allowedRoles={['admin']}><AppLayout><WorkflowPage /></AppLayout></ProtectedRoute>} />
                <Route path="/admin/mdas" element={<ProtectedRoute allowedRoles={['admin']}><AppLayout><MDAsPage /></AppLayout></ProtectedRoute>} />
                <Route path="/admin/suppliers" element={<ProtectedRoute allowedRoles={['admin']}><AppLayout><SuppliersPage /></AppLayout></ProtectedRoute>} />
                <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AppLayout><AnalyticsPage /></AppLayout></ProtectedRoute>} />
                <Route path="/admin/timeline" element={<ProtectedRoute allowedRoles={['admin']}><AppLayout><TimelinePage /></AppLayout></ProtectedRoute>} />
                <Route path="/admin/payment-schedule" element={<ProtectedRoute allowedRoles={['admin']}><AppLayout><PaymentSchedulePage /></AppLayout></ProtectedRoute>} />

                {/* Root redirect to auth */}
                <Route path="/" element={<Navigate to="/auth" replace />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </FilterProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
