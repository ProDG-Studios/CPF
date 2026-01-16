import { useState, useRef } from 'react';
import { Upload, X, FileText, Check, Trash2, Eye, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  StoredDocument, 
  addDocument, 
  deleteDocument, 
  getDocumentsForEntity,
  updateDocumentStatus 
} from '@/lib/documentStorage';
import { toast } from 'sonner';

interface DocumentUploadProps {
  entityType: 'bill' | 'supplier' | 'mda' | 'step';
  entityId: string;
  onUpload?: (doc: StoredDocument) => void;
}

const categoryOptions = [
  { value: 'invoice', label: 'Invoice' },
  { value: 'contract', label: 'Contract' },
  { value: 'verification', label: 'Verification Document' },
  { value: 'payment', label: 'Payment Proof' },
  { value: 'other', label: 'Other' },
];

export const DocumentUpload = ({ entityType, entityId, onUpload }: DocumentUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [category, setCategory] = useState<'invoice' | 'contract' | 'verification' | 'payment' | 'other'>('invoice');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    files.forEach(file => {
      const doc = addDocument({
        name: file.name,
        type: file.type,
        size: file.size,
        entityType,
        entityId,
        category,
        status: 'pending',
        uploadedBy: 'Admin',
      });
      
      toast.success(`${file.name} uploaded successfully`);
      onUpload?.(doc);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as typeof category)}
          className="px-3 py-1.5 bg-secondary border border-border rounded-md text-sm"
        >
          {categoryOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragging ? "border-accent bg-accent/5" : "border-border hover:border-muted-foreground"
        )}
      >
        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-medium">Drop files here or click to upload</p>
        <p className="text-xs text-muted-foreground mt-1">PDF, DOC, XLS up to 10MB</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

interface DocumentListProps {
  entityType: 'bill' | 'supplier' | 'mda' | 'step';
  entityId: string;
  refreshKey?: number;
}

export const DocumentList = ({ entityType, entityId, refreshKey }: DocumentListProps) => {
  const [documents, setDocuments] = useState<StoredDocument[]>(() => 
    getDocumentsForEntity(entityType, entityId)
  );

  // Refresh when refreshKey changes
  useState(() => {
    setDocuments(getDocumentsForEntity(entityType, entityId));
  });

  const handleVerify = (docId: string) => {
    updateDocumentStatus(docId, 'verified');
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'verified' } : d));
    toast.success('Document verified');
  };

  const handleReject = (docId: string) => {
    updateDocumentStatus(docId, 'rejected');
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'rejected' } : d));
    toast.warning('Document rejected');
  };

  const handleDelete = (docId: string) => {
    deleteDocument(docId);
    setDocuments(prev => prev.filter(d => d.id !== docId));
    toast.info('Document deleted');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-muted-foreground">
        No documents uploaded yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map(doc => (
        <div 
          key={doc.id}
          className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg"
        >
          <div className="p-2 bg-secondary rounded-md">
            <FileText className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{doc.name}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatFileSize(doc.size)}</span>
              <span>•</span>
              <span className="capitalize">{doc.category}</span>
              <span>•</span>
              <span className={cn(
                "px-1.5 py-0.5 rounded font-medium",
                doc.status === 'verified' && "bg-success/10 text-success",
                doc.status === 'pending' && "bg-warning/10 text-warning",
                doc.status === 'rejected' && "bg-destructive/10 text-destructive",
              )}>
                {doc.status}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {doc.status === 'pending' && (
              <>
                <button
                  onClick={() => handleVerify(doc.id)}
                  className="p-1.5 hover:bg-success/10 rounded-md transition-colors"
                  title="Verify"
                >
                  <Check className="w-4 h-4 text-success" />
                </button>
                <button
                  onClick={() => handleReject(doc.id)}
                  className="p-1.5 hover:bg-destructive/10 rounded-md transition-colors"
                  title="Reject"
                >
                  <X className="w-4 h-4 text-destructive" />
                </button>
              </>
            )}
            <button
              onClick={() => handleDelete(doc.id)}
              className="p-1.5 hover:bg-destructive/10 rounded-md transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'bill' | 'supplier' | 'mda' | 'step';
  entityId: string;
  title: string;
}

export const DocumentModal = ({ isOpen, onClose, entityType, entityId, title }: DocumentModalProps) => {
  const [refreshKey, setRefreshKey] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg max-w-lg w-full max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-md transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Upload New Document</h3>
            <DocumentUpload 
              entityType={entityType} 
              entityId={entityId}
              onUpload={() => setRefreshKey(k => k + 1)}
            />
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-medium mb-2">Existing Documents</h3>
            <DocumentList 
              entityType={entityType} 
              entityId={entityId}
              refreshKey={refreshKey}
            />
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-secondary text-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
