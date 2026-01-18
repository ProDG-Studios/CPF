// Document storage - simulates file uploads stored in memory/localStorage

export interface StoredDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  entityType: 'bill' | 'supplier' | 'mda' | 'step';
  entityId: string;
  category: 'invoice' | 'contract' | 'verification' | 'payment' | 'other';
  status: 'pending' | 'verified' | 'rejected';
  uploadedBy: string;
  // Base64 preview for images (small thumbnails only)
  preview?: string;
}

const DOCS_STORAGE_KEY = 'cpf_poc_documents';

// Get all documents from storage
export const getStoredDocuments = (): StoredDocument[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(DOCS_STORAGE_KEY);
  if (stored) {
    try {
      const docs = JSON.parse(stored);
      return docs.map((d: StoredDocument) => ({
        ...d,
        uploadedAt: new Date(d.uploadedAt),
      }));
    } catch (e) {
      return [];
    }
  }
  return getInitialDocuments();
};

// Save documents to storage
export const saveDocuments = (docs: StoredDocument[]) => {
  localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(docs));
};

// Add a new document
export const addDocument = (doc: Omit<StoredDocument, 'id' | 'uploadedAt'>): StoredDocument => {
  const newDoc: StoredDocument = {
    ...doc,
    id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    uploadedAt: new Date(),
  };
  const docs = getStoredDocuments();
  docs.push(newDoc);
  saveDocuments(docs);
  return newDoc;
};

// Delete a document
export const deleteDocument = (docId: string) => {
  const docs = getStoredDocuments().filter(d => d.id !== docId);
  saveDocuments(docs);
};

// Get documents for a specific entity
export const getDocumentsForEntity = (entityType: string, entityId: string): StoredDocument[] => {
  return getStoredDocuments().filter(d => d.entityType === entityType && d.entityId === entityId);
};

// Update document status
export const updateDocumentStatus = (docId: string, status: 'pending' | 'verified' | 'rejected') => {
  const docs = getStoredDocuments().map(d =>
    d.id === docId ? { ...d, status } : d
  );
  saveDocuments(docs);
};

// Initial seed documents
const getInitialDocuments = (): StoredDocument[] => [
  {
    id: 'doc-001',
    name: 'Invoice_PB-2024-00001.pdf',
    type: 'application/pdf',
    size: 245000,
    uploadedAt: new Date('2024-01-05'),
    entityType: 'bill',
    entityId: 'PB-2024-00001',
    category: 'invoice',
    status: 'verified',
    uploadedBy: 'System',
  },
  {
    id: 'doc-002',
    name: 'Contract_KBS_Roads.pdf',
    type: 'application/pdf',
    size: 1200000,
    uploadedAt: new Date('2024-01-04'),
    entityType: 'bill',
    entityId: 'PB-2024-00001',
    category: 'contract',
    status: 'verified',
    uploadedBy: 'System',
  },
  {
    id: 'doc-003',
    name: 'Verification_Certificate.pdf',
    type: 'application/pdf',
    size: 89000,
    uploadedAt: new Date('2024-01-10'),
    entityType: 'bill',
    entityId: 'PB-2024-00001',
    category: 'verification',
    status: 'verified',
    uploadedBy: 'MDA Verification Committee',
  },
  {
    id: 'doc-004',
    name: 'Invoice_PB-2024-00002.pdf',
    type: 'application/pdf',
    size: 198000,
    uploadedAt: new Date('2024-01-06'),
    entityType: 'bill',
    entityId: 'PB-2024-00002',
    category: 'invoice',
    status: 'verified',
    uploadedBy: 'System',
  },
  {
    id: 'doc-005',
    name: 'Supplier_KYC_sup-001.pdf',
    type: 'application/pdf',
    size: 567000,
    uploadedAt: new Date('2024-01-02'),
    entityType: 'supplier',
    entityId: 'sup-001',
    category: 'verification',
    status: 'verified',
    uploadedBy: 'Compliance Team',
  },
  {
    id: 'doc-006',
    name: 'Tax_Compliance_sup-001.pdf',
    type: 'application/pdf',
    size: 123000,
    uploadedAt: new Date('2024-01-02'),
    entityType: 'supplier',
    entityId: 'sup-001',
    category: 'verification',
    status: 'verified',
    uploadedBy: 'Compliance Team',
  },
  {
    id: 'doc-007',
    name: 'MDA_Consent_Letter.pdf',
    type: 'application/pdf',
    size: 345000,
    uploadedAt: new Date('2024-01-08'),
    entityType: 'step',
    entityId: 'step-4',
    category: 'contract',
    status: 'verified',
    uploadedBy: 'MDA Accounting Officer',
  },
  {
    id: 'doc-008',
    name: 'Budget_Authorization.pdf',
    type: 'application/pdf',
    size: 456000,
    uploadedAt: new Date('2024-01-08'),
    entityType: 'step',
    entityId: 'step-4',
    category: 'contract',
    status: 'verified',
    uploadedBy: 'MDA Accounting Officer',
  },
];

// Initialize documents on first load
if (typeof window !== 'undefined' && !localStorage.getItem(DOCS_STORAGE_KEY)) {
  saveDocuments(getInitialDocuments());
}
