import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FilterProvider } from "@/contexts/FilterContext";
import { DataProvider } from "@/contexts/DataContext";
import AppLayout from "@/components/layout/AppLayout";
import ScrollToTop from "@/components/ScrollToTop";
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
    <DataProvider>
      <FilterProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <AppLayout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/bills" element={<BillsExplorer />} />
                <Route path="/workflow" element={<WorkflowPage />} />
                <Route path="/mdas" element={<MDAsPage />} />
                <Route path="/suppliers" element={<SuppliersPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/timeline" element={<TimelinePage />} />
                <Route path="/payment-schedule" element={<PaymentSchedulePage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </BrowserRouter>
        </TooltipProvider>
      </FilterProvider>
    </DataProvider>
  </QueryClientProvider>
);

export default App;
