import { useState, useRef } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { importData } from '../utils/storage';

export default function ImportModal({ onClose, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('merge');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/json') {
      setFile(selectedFile);
      setResult(null);
    } else {
      alert('Please select a valid JSON file');
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsProcessing(true);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const jsonData = e.target.result;
      const importResult = importData(jsonData, mode);
      setResult(importResult);

      if (importResult.success) {
        setTimeout(() => {
          onImportSuccess();
          handleClose();
        }, 1500);
      } else {
        setIsProcessing(false);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/json') {
      setFile(droppedFile);
      setResult(null);
    } else {
      alert('Please drop a valid JSON file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleClose = () => {
    setFile(null);
    setMode('merge');
    setResult(null);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Import Playlists</h2>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            disabled={isProcessing}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!result ? (
          <>
            {/* File Drop Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-6 ${
                file
                  ? 'border-zinc-600 bg-zinc-800/50'
                  : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/30'
              }`}
            >
              {file ? (
                <div className="flex items-center justify-center gap-3 text-white">
                  <FileText className="w-8 h-8 text-gray-400" />
                  <span className="font-medium">{file.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="p-1 text-gray-400 hover:text-red-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400 mb-2">
                    Drag & drop your backup file here
                  </p>
                  <p className="text-gray-600 text-sm">
                    or click to browse
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Import Mode */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-3">
                Import Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode('merge')}
                  className={`p-4 rounded-xl text-left transition-colors ${
                    mode === 'merge'
                      ? 'bg-white text-black'
                      : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                  }`}
                >
                  <div className="font-medium mb-1">Merge</div>
                  <div className="text-xs opacity-70">
                    Add new playlists to existing ones
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('replace')}
                  className={`p-4 rounded-xl text-left transition-colors ${
                    mode === 'replace'
                      ? 'bg-white text-black'
                      : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                  }`}
                >
                  <div className="font-medium mb-1">Replace</div>
                  <div className="text-xs opacity-70">
                    Replace all existing playlists
                  </div>
                </button>
              </div>
            </div>

            {/* Warning for replace mode */}
            {mode === 'replace' && (
              <div className="flex items-start gap-3 p-4 bg-red-900/20 border border-red-900/50 rounded-xl mb-6">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-300">
                  <strong>Warning:</strong> This will delete all your existing playlists and
                  replace them with the imported data. This action cannot be undone.
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!file || isProcessing}
                className="flex-1 px-4 py-3 bg-white hover:bg-gray-200 disabled:bg-gray-600 disabled:cursor-not-allowed text-black rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Import
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          /* Result */
          <div className="py-6">
            {result.success ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Import Successful!</h3>
                <div className="text-gray-400 space-y-1">
                  <p>{result.playlistsImported} playlist(s) in file</p>
                  {mode === 'merge' && (
                    <p>{result.playlistsAdded} new playlist(s) added</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Import Failed</h3>
                <p className="text-red-400">{result.error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
