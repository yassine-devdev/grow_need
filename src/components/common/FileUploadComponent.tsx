/**
 * Comprehensive File Upload Component
 * Supports drag-and-drop, progress tracking, and real file processing
 */

import React, { useState, useRef, useCallback } from 'react';
import { Icons } from '../icons';
import { advancedFileProcessor } from '../../services/advancedFileProcessor';
import { enhancedAIProvider } from '../../services/enhancedAIProvider';

interface FileUploadProps {
  onUploadComplete?: (result: UploadResult) => void;
  onUploadProgress?: (progress: number) => void;
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
  multiple?: boolean;
  className?: string;
}

interface UploadResult {
  success: boolean;
  filename: string;
  documentId?: string;
  error?: string;
  metadata?: any;
  processingStats?: any;
}

interface FileProcessingState {
  file: File;
  status: 'pending' | 'processing' | 'complete' | 'error';
  progress: number;
  error?: string;
  result?: any;
}

const FileUploadComponent: React.FC<FileUploadProps> = ({
  onUploadComplete,
  onUploadProgress,
  acceptedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    'application/json'
  ],
  maxFileSize = 50, // 50MB default
  multiple = true,
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<FileProcessingState[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isConnected, setIsConnected] = useState(false);

  // Check connection status
  React.useEffect(() => {
    const checkConnection = async () => {
      try {
        const healthStatus = await enhancedAIProvider.getHealthStatus();
        setIsConnected(healthStatus.vectorDB === true);
      } catch (error) {
        setIsConnected(false);
      }
    };
    checkConnection();
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} not supported. Supported types: ${acceptedTypes.join(', ')}`;
    }
    
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds limit of ${maxFileSize}MB`;
    }
    
    return null;
  }, [acceptedTypes, maxFileSize]);

  const updateFileState = useCallback((fileIndex: number, updates: Partial<FileProcessingState>) => {
    setFiles(prev => prev.map((file, index) => 
      index === fileIndex ? { ...file, ...updates } : file
    ));
  }, []);

  const processFile = useCallback(async (fileState: FileProcessingState, fileIndex: number) => {
    const updateFileState = (updates: Partial<FileProcessingState>) => {
      setFiles(prev => prev.map((file, index) => 
        index === fileIndex ? { ...file, ...updates } : file
      ));
    };

    try {
      // Step 1: Process file locally
      updateFileState({ status: 'processing', progress: 25 });
      
      const processingResult = await advancedFileProcessor.processFile(fileState.file, {
        extractMetadata: true,
        analyzeContent: true,
        generateChunks: true,
        chunkSize: 1000
      });

      if (!processingResult.success) {
        throw new Error(processingResult.error || 'File processing failed');
      }

      updateFileState({ progress: 50 });

      // Step 2: Upload to vector DB (if available)
      let uploadResult = null;
      if (isConnected) {
        updateFileState({ progress: 75 });
        
        const metadata = {
          title: processingResult.metadata?.title || fileState.file.name,
          subject: processingResult.metadata?.subject || 'General',
          grade_level: processingResult.metadata?.gradeLevel || 'Unknown',
          content_type: 'educational_content',
          description: `Processed file: ${fileState.file.name}`
        };

        uploadResult = await enhancedAIProvider.uploadContent(fileState.file, metadata);
        
        if (!uploadResult.success) {
          console.warn('Vector DB upload failed:', uploadResult.error);
          // Continue anyway - local processing succeeded
        }
      }

      // Step 3: Complete
      updateFileState({ 
        status: 'complete', 
        progress: 100,
        result: {
          processing: processingResult,
          upload: uploadResult
        }
      });

      // Notify parent component
      const result: UploadResult = {
        success: true,
        filename: fileState.file.name,
        documentId: uploadResult?.document_id,
        metadata: processingResult.metadata,
        processingStats: advancedFileProcessor.getProcessingStats(processingResult)
      };

      onUploadComplete?.(result);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      updateFileState({ 
        status: 'error', 
        error: errorMessage 
      });

      onUploadComplete?.({
        success: false,
        filename: fileState.file.name,
        error: errorMessage
      });
    }
  }, [isConnected, onUploadComplete]);

  const handleFiles = useCallback(async (fileList: FileList) => {
    const newFiles: FileProcessingState[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const validationError = validateFile(file);
      
      if (validationError) {
        onUploadComplete?.({
          success: false,
          filename: file.name,
          error: validationError
        });
        continue;
      }

      newFiles.push({
        file,
        status: 'pending',
        progress: 0
      });
    }

    if (newFiles.length === 0) return;

    setFiles(prev => [...prev, ...newFiles]);
    setIsProcessing(true);

    // Process files sequentially
    const startIndex = files.length;
    for (let i = 0; i < newFiles.length; i++) {
      await processFile(newFiles[i], startIndex + i);
    }

    setIsProcessing(false);
  }, [files.length, validateFile, processFile, onUploadComplete]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, [handleFiles]);

  const handleUploadClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) {
      fileInputRef.current?.click();
    }
  }, [isProcessing]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [handleFiles]);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const getStatusIcon = (status: FileProcessingState['status']) => {
    switch (status) {
      case 'complete':
        return <Icons.CheckCircle size={16} style={{ color: '#22c55e' }} />;
      case 'error':
        return <Icons.AlertCircle size={16} style={{ color: '#ef4444' }} />;
      case 'processing':
        return <Icons.Loader2 size={16} style={{ color: '#3b82f6' }} className="animate-spin" />;
      default:
        return <Icons.Clock size={16} style={{ color: '#6b7280' }} />;
    }
  };

  return (
    <div className={`file-upload-component ${className}`}>
      {/* Upload Area */}
      <div
        className={`file-upload-dropzone ${isDragOver ? 'drag-over' : ''} ${isProcessing ? 'processing' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleUploadClick}
        style={{ cursor: isProcessing ? 'not-allowed' : 'pointer' }}
      >
        <div className="upload-content">
          <Icons.UploadCloud size={48} className="upload-icon" />
          <h3>Upload Educational Content</h3>
          <p>Drag and drop files here, or click to browse</p>
          <div className="upload-info">
            <p>Supported formats: PDF, DOCX, XLSX, TXT, CSV, JSON</p>
            <p>Maximum file size: {maxFileSize}MB</p>
            {!isConnected && (
              <p className="warning">⚠️ Vector DB offline - files will be processed locally only</p>
            )}
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="file-list">
          <div className="file-list-header">
            <h4>Processing Files ({files.length})</h4>
            <button onClick={clearFiles} className="clear-files-btn">
              <Icons.XCircle size={16} />
              Clear All
            </button>
          </div>
          <div className="file-items">
            {files.map((fileState, index) => (
              <div key={index} className={`file-item ${fileState.status}`}>
                <div className="file-info">
                  <Icons.FileText size={20} className="file-icon" />
                  <div className="file-details">
                    <div className="file-name">{fileState.file.name}</div>
                    <div className="file-meta">
                      {(fileState.file.size / 1024 / 1024).toFixed(1)}MB • {fileState.file.type}
                    </div>
                  </div>
                </div>
                
                <div className="file-status">
                  {getStatusIcon(fileState.status)}
                  <span className="status-text">{fileState.status}</span>
                </div>

                {fileState.status === 'processing' && (
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${fileState.progress}%` }}
                    />
                  </div>
                )}

                {fileState.error && (
                  <div className="error-message">
                    {fileState.error}
                  </div>
                )}

                {fileState.result && fileState.status === 'complete' && (
                  <div className="processing-results">
                    <div className="result-stats">
                      ✅ Processed: {fileState.result.processing?.wordCount || 0} words, 
                      Reading Level: {fileState.result.processing?.readingLevel || 'N/A'}
                      {fileState.result.upload?.success && (
                        <span> • Uploaded to Vector DB</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadComponent;
