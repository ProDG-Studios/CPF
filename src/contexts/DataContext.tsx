import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { 
  billsData as initialBills, 
  supplierData as initialSuppliers, 
  mdaData as initialMDAs,
  transactionSteps as initialSteps,
  timelineEvents as initialEvents,
  paymentSchedules as initialSchedules,
  Bill, 
  Supplier, 
  MDA, 
  TransactionStep, 
  TimelineEvent,
  PaymentSchedule
} from '@/data/mockData';

// Activity log for real-time updates
export interface ActivityLog {
  id: string;
  timestamp: Date;
  type: 'bill_verified' | 'bill_processed' | 'bill_paid' | 'bill_rejected' | 'step_completed' | 'payment_made' | 'supplier_verified';
  title: string;
  description: string;
  entityId?: string;
  amount?: number;
}

// Notification for user feedback
export interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface DataState {
  bills: Bill[];
  suppliers: Supplier[];
  mdas: MDA[];
  transactionSteps: TransactionStep[];
  timelineEvents: TimelineEvent[];
  paymentSchedules: PaymentSchedule[];
  activityLog: ActivityLog[];
  notifications: Notification[];
}

interface DataContextType extends DataState {
  // Bill actions
  verifyBill: (billId: string) => void;
  processBill: (billId: string) => void;
  payBill: (billId: string) => void;
  rejectBill: (billId: string) => void;
  bulkVerifyBills: (billIds: string[]) => void;
  
  // Supplier actions
  verifySupplier: (supplierId: string) => void;
  suspendSupplier: (supplierId: string) => void;
  
  // Transaction step actions
  completeStep: (stepNumber: number) => void;
  activateStep: (stepNumber: number) => void;
  
  // Payment schedule actions
  makePayment: (scheduleId: string, quarterIndex: number) => void;
  
  // Notification actions
  markNotificationRead: (notificationId: string) => void;
  clearNotifications: () => void;
  
  // Stats
  getStats: () => {
    totalBills: number;
    totalAmount: number;
    verifiedBills: number;
    verifiedAmount: number;
    processingBills: number;
    processingAmount: number;
    pendingBills: number;
    pendingAmount: number;
    paidBills: number;
    paidAmount: number;
    rejectedBills: number;
    rejectedAmount: number;
  };
  
  // Reset
  resetData: () => void;
}

const STORAGE_KEY = 'cpf_poc_data';

const getInitialState = (): DataState => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        parsed.activityLog = parsed.activityLog?.map((log: ActivityLog) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        })) || [];
        parsed.notifications = parsed.notifications?.map((n: Notification) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })) || [];
        return parsed;
      } catch (e) {
        console.error('Failed to parse stored data:', e);
      }
    }
  }
  
  return {
    bills: initialBills,
    suppliers: initialSuppliers,
    mdas: initialMDAs,
    transactionSteps: initialSteps,
    timelineEvents: initialEvents,
    paymentSchedules: initialSchedules,
    activityLog: [],
    notifications: [],
  };
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DataState>(getInitialState);
  
  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);
  
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const addActivity = useCallback((activity: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newActivity: ActivityLog = {
      ...activity,
      id: generateId(),
      timestamp: new Date(),
    };
    setState(prev => ({
      ...prev,
      activityLog: [newActivity, ...prev.activityLog].slice(0, 100), // Keep last 100 activities
    }));
    return newActivity;
  }, []);
  
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      timestamp: new Date(),
      read: false,
    };
    setState(prev => ({
      ...prev,
      notifications: [newNotification, ...prev.notifications].slice(0, 50),
    }));
  }, []);
  
  const verifyBill = useCallback((billId: string) => {
    setState(prev => {
      const bill = prev.bills.find(b => b.id === billId);
      if (!bill || bill.status === 'verified') return prev;
      
      const updatedBills = prev.bills.map(b =>
        b.id === billId
          ? { ...b, status: 'verified' as const, verificationDate: new Date().toISOString().split('T')[0] }
          : b
      );
      
      // Update supplier verified amount
      const updatedSuppliers = prev.suppliers.map(s =>
        s.id === bill.supplierId
          ? { ...s, verifiedAmount: s.verifiedAmount + bill.amount, pendingAmount: s.pendingAmount - bill.amount }
          : s
      );
      
      // Update MDA verified stats
      const updatedMDAs = prev.mdas.map(m =>
        m.id === bill.mdaId
          ? { 
              ...m, 
              verifiedBills: m.verifiedBills + 1, 
              verifiedAmount: m.verifiedAmount + bill.amount,
              pendingBills: m.pendingBills - 1,
              pendingAmount: m.pendingAmount - bill.amount
            }
          : m
      );
      
      return { ...prev, bills: updatedBills, suppliers: updatedSuppliers, mdas: updatedMDAs };
    });
    
    const bill = state.bills.find(b => b.id === billId);
    if (bill) {
      addActivity({
        type: 'bill_verified',
        title: 'Bill Verified',
        description: `${bill.id} from ${bill.supplierName} verified`,
        entityId: billId,
        amount: bill.amount,
      });
      addNotification({
        type: 'success',
        title: 'Bill Verified',
        message: `Bill ${bill.id} has been verified successfully.`,
      });
    }
  }, [state.bills, addActivity, addNotification]);
  
  const processBill = useCallback((billId: string) => {
    setState(prev => {
      const bill = prev.bills.find(b => b.id === billId);
      if (!bill || bill.status !== 'verified') return prev;
      
      return {
        ...prev,
        bills: prev.bills.map(b =>
          b.id === billId ? { ...b, status: 'processing' as const } : b
        ),
      };
    });
    
    const bill = state.bills.find(b => b.id === billId);
    if (bill) {
      addActivity({
        type: 'bill_processed',
        title: 'Bill Processing',
        description: `${bill.id} moved to processing queue`,
        entityId: billId,
        amount: bill.amount,
      });
    }
  }, [state.bills, addActivity]);
  
  const payBill = useCallback((billId: string) => {
    setState(prev => {
      const bill = prev.bills.find(b => b.id === billId);
      if (!bill || (bill.status !== 'verified' && bill.status !== 'processing')) return prev;
      
      return {
        ...prev,
        bills: prev.bills.map(b =>
          b.id === billId
            ? { ...b, status: 'paid' as const, paymentDate: new Date().toISOString().split('T')[0] }
            : b
        ),
      };
    });
    
    const bill = state.bills.find(b => b.id === billId);
    if (bill) {
      addActivity({
        type: 'bill_paid',
        title: 'Bill Paid',
        description: `${bill.id} paid to ${bill.supplierName}`,
        entityId: billId,
        amount: bill.amount,
      });
      addNotification({
        type: 'success',
        title: 'Payment Completed',
        message: `Payment of KES ${bill.amount.toLocaleString()} made for ${bill.id}.`,
      });
    }
  }, [state.bills, addActivity, addNotification]);
  
  const rejectBill = useCallback((billId: string) => {
    setState(prev => {
      const bill = prev.bills.find(b => b.id === billId);
      if (!bill) return prev;
      
      return {
        ...prev,
        bills: prev.bills.map(b =>
          b.id === billId ? { ...b, status: 'rejected' as const } : b
        ),
      };
    });
    
    const bill = state.bills.find(b => b.id === billId);
    if (bill) {
      addActivity({
        type: 'bill_rejected',
        title: 'Bill Rejected',
        description: `${bill.id} rejected - verification failed`,
        entityId: billId,
        amount: bill.amount,
      });
      addNotification({
        type: 'warning',
        title: 'Bill Rejected',
        message: `Bill ${bill.id} has been rejected.`,
      });
    }
  }, [state.bills, addActivity, addNotification]);
  
  const bulkVerifyBills = useCallback((billIds: string[]) => {
    billIds.forEach(id => verifyBill(id));
    addNotification({
      type: 'success',
      title: 'Bulk Verification Complete',
      message: `${billIds.length} bills verified successfully.`,
    });
  }, [verifyBill, addNotification]);
  
  const verifySupplier = useCallback((supplierId: string) => {
    setState(prev => ({
      ...prev,
      suppliers: prev.suppliers.map(s =>
        s.id === supplierId ? { ...s, status: 'verified' as const } : s
      ),
    }));
    
    const supplier = state.suppliers.find(s => s.id === supplierId);
    if (supplier) {
      addActivity({
        type: 'supplier_verified',
        title: 'Supplier Verified',
        description: `${supplier.name} verification complete`,
        entityId: supplierId,
      });
      addNotification({
        type: 'success',
        title: 'Supplier Verified',
        message: `${supplier.name} is now verified.`,
      });
    }
  }, [state.suppliers, addActivity, addNotification]);
  
  const suspendSupplier = useCallback((supplierId: string) => {
    setState(prev => ({
      ...prev,
      suppliers: prev.suppliers.map(s =>
        s.id === supplierId ? { ...s, status: 'suspended' as const } : s
      ),
    }));
  }, []);
  
  const completeStep = useCallback((stepNumber: number) => {
    setState(prev => {
      const step = prev.transactionSteps.find(s => s.step === stepNumber);
      if (!step || step.status === 'completed') return prev;
      
      const updatedSteps = prev.transactionSteps.map(s =>
        s.step === stepNumber
          ? { ...s, status: 'completed' as const, completedDate: new Date().toISOString().split('T')[0] }
          : s.step === stepNumber + 1
          ? { ...s, status: 'active' as const }
          : s
      );
      
      return { ...prev, transactionSteps: updatedSteps };
    });
    
    const step = state.transactionSteps.find(s => s.step === stepNumber);
    if (step) {
      addActivity({
        type: 'step_completed',
        title: 'Step Completed',
        description: `${step.title} marked as complete`,
        entityId: `step-${stepNumber}`,
      });
      addNotification({
        type: 'success',
        title: 'Step Completed',
        message: `"${step.title}" has been completed.`,
      });
    }
  }, [state.transactionSteps, addActivity, addNotification]);
  
  const activateStep = useCallback((stepNumber: number) => {
    setState(prev => ({
      ...prev,
      transactionSteps: prev.transactionSteps.map(s =>
        s.step === stepNumber ? { ...s, status: 'active' as const } : s
      ),
    }));
  }, []);
  
  const makePayment = useCallback((scheduleId: string, quarterIndex: number) => {
    setState(prev => {
      const schedule = prev.paymentSchedules.find(s => s.id === scheduleId);
      if (!schedule) return prev;
      
      const payment = schedule.quarterlyPayments[quarterIndex];
      if (!payment || payment.status === 'paid') return prev;
      
      const updatedSchedules = prev.paymentSchedules.map(s =>
        s.id === scheduleId
          ? {
              ...s,
              quarterlyPayments: s.quarterlyPayments.map((p, i) =>
                i === quarterIndex
                  ? { ...p, status: 'paid' as const, paidDate: new Date().toISOString().split('T')[0] }
                  : p
              ),
              totalPaid: s.totalPaid + payment.amount,
            }
          : s
      );
      
      return { ...prev, paymentSchedules: updatedSchedules };
    });
    
    const schedule = state.paymentSchedules.find(s => s.id === scheduleId);
    if (schedule) {
      const payment = schedule.quarterlyPayments[quarterIndex];
      addActivity({
        type: 'payment_made',
        title: 'Treasury Payment',
        description: `${schedule.mdaName} - ${payment.quarter} payment received`,
        entityId: scheduleId,
        amount: payment.amount,
      });
      addNotification({
        type: 'success',
        title: 'Payment Received',
        message: `${payment.quarter} payment from ${schedule.mdaName} recorded.`,
      });
    }
  }, [state.paymentSchedules, addActivity, addNotification]);
  
  const markNotificationRead = useCallback((notificationId: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
    }));
  }, []);
  
  const clearNotifications = useCallback(() => {
    setState(prev => ({ ...prev, notifications: [] }));
  }, []);
  
  const getStats = useCallback(() => {
    const bills = state.bills;
    return {
      totalBills: bills.length,
      totalAmount: bills.reduce((sum, b) => sum + b.amount, 0),
      verifiedBills: bills.filter(b => b.status === 'verified').length,
      verifiedAmount: bills.filter(b => b.status === 'verified').reduce((sum, b) => sum + b.amount, 0),
      processingBills: bills.filter(b => b.status === 'processing').length,
      processingAmount: bills.filter(b => b.status === 'processing').reduce((sum, b) => sum + b.amount, 0),
      pendingBills: bills.filter(b => b.status === 'pending').length,
      pendingAmount: bills.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.amount, 0),
      paidBills: bills.filter(b => b.status === 'paid').length,
      paidAmount: bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.amount, 0),
      rejectedBills: bills.filter(b => b.status === 'rejected').length,
      rejectedAmount: bills.filter(b => b.status === 'rejected').reduce((sum, b) => sum + b.amount, 0),
    };
  }, [state.bills]);
  
  const resetData = useCallback(() => {
    const initialState: DataState = {
      bills: initialBills,
      suppliers: initialSuppliers,
      mdas: initialMDAs,
      transactionSteps: initialSteps,
      timelineEvents: initialEvents,
      paymentSchedules: initialSchedules,
      activityLog: [],
      notifications: [],
    };
    setState(initialState);
    localStorage.removeItem(STORAGE_KEY);
    addNotification({
      type: 'info',
      title: 'Data Reset',
      message: 'All data has been reset to initial state.',
    });
  }, [addNotification]);
  
  const value = useMemo(() => ({
    ...state,
    verifyBill,
    processBill,
    payBill,
    rejectBill,
    bulkVerifyBills,
    verifySupplier,
    suspendSupplier,
    completeStep,
    activateStep,
    makePayment,
    markNotificationRead,
    clearNotifications,
    getStats,
    resetData,
  }), [
    state,
    verifyBill,
    processBill,
    payBill,
    rejectBill,
    bulkVerifyBills,
    verifySupplier,
    suspendSupplier,
    completeStep,
    activateStep,
    makePayment,
    markNotificationRead,
    clearNotifications,
    getStats,
    resetData,
  ]);
  
  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
