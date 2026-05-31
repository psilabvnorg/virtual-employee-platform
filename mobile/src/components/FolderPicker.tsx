import React, { useState, useEffect, useCallback } from 'react';
import { listFolders, createFolder, getFolderName, DriveFolder } from '../lib/driveApi';

interface BreadcrumbEntry {
  id: string;
  name: string;
}

interface Props {
  accessToken: string;
  selectedFolderId: string;
  selectedFolderName: string;
  onSelect: (id: string, name: string) => void;
}

export function FolderPicker({ accessToken, selectedFolderId, selectedFolderName, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbEntry[]>([{ id: 'root', name: 'My Drive' }]);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [error, setError] = useState('');
  const [showCreateInput, setShowCreateInput] = useState(false);

  const currentFolder = breadcrumb[breadcrumb.length - 1];

  const loadFolders = useCallback(async (parentId: string) => {
    setLoading(true);
    setError('');
    try {
      const list = await listFolders(accessToken, parentId);
      setFolders(list);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (open) loadFolders(currentFolder.id);
  }, [open, currentFolder.id, loadFolders]);

  function navigateInto(folder: DriveFolder) {
    setBreadcrumb((prev) => [...prev, { id: folder.id, name: folder.name }]);
  }

  function navigateTo(index: number) {
    setBreadcrumb((prev) => prev.slice(0, index + 1));
  }

  async function handleCreate() {
    const name = newFolderName.trim();
    if (!name) return;
    setCreating(true);
    try {
      await createFolder(accessToken, name, currentFolder.id);
      setNewFolderName('');
      setShowCreateInput(false);
      await loadFolders(currentFolder.id);
    } catch (err) {
      setError(String(err));
    } finally {
      setCreating(false);
    }
  }

  function handleSelect(folder: DriveFolder) {
    const path = [...breadcrumb.map((b) => b.name), folder.name].join(' / ');
    onSelect(folder.id, path);
    setOpen(false);
  }

  function handleSelectCurrent() {
    const path = breadcrumb.map((b) => b.name).join(' / ');
    onSelect(currentFolder.id, path);
    setOpen(false);
  }

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-surface border border-muted rounded-xl px-4 py-3 text-left flex items-center gap-3 active:opacity-70"
      >
        <span className="text-xl">📁</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">Root Folder</p>
          <p className="text-sm text-white truncate mt-0.5">
            {selectedFolderName || selectedFolderId || 'Not selected'}
          </p>
        </div>
        <span className="text-gray-500 text-xs">Change</span>
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col safe-top">
          <div className="bg-surface flex-1 flex flex-col max-h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 pt-5 pb-3 border-b border-muted">
              <button onClick={() => setOpen(false)} className="text-gray-400 text-lg">✕</button>
              <h2 className="text-base font-semibold text-white">Select Folder</h2>
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto no-scrollbar border-b border-muted">
              {breadcrumb.map((crumb, i) => (
                <React.Fragment key={crumb.id}>
                  {i > 0 && <span className="text-gray-600 text-xs">/</span>}
                  <button
                    onClick={() => navigateTo(i)}
                    className={`text-xs px-1.5 py-0.5 rounded whitespace-nowrap ${
                      i === breadcrumb.length - 1
                        ? 'text-accent font-medium'
                        : 'text-gray-400'
                    }`}
                  >
                    {crumb.name}
                  </button>
                </React.Fragment>
              ))}
            </div>

            {/* Folder list */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
              {loading && (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {error && <p className="text-red-400 text-sm py-4">{error}</p>}
              {!loading && folders.length === 0 && !error && (
                <p className="text-gray-600 text-sm py-4 text-center">No sub-folders here.</p>
              )}
              {!loading && folders.map((folder) => (
                <div key={folder.id} className="flex items-center gap-2">
                  <button
                    onClick={() => navigateInto(folder)}
                    className="flex-1 flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-muted active:bg-muted text-left"
                  >
                    <span className="text-lg">📁</span>
                    <span className="text-sm text-white truncate">{folder.name}</span>
                    <span className="text-gray-600 text-xs ml-auto">›</span>
                  </button>
                  <button
                    onClick={() => handleSelect(folder)}
                    className="text-xs text-accent px-3 py-1.5 border border-accent rounded-lg shrink-0"
                  >
                    Use
                  </button>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="px-4 pb-6 pt-3 border-t border-muted space-y-3 safe-bottom">
              {showCreateInput ? (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">New folder name</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Invoices 2026"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                      autoFocus
                      className="flex-1 bg-ink border border-accent rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCreate}
                      disabled={!newFolderName.trim() || creating}
                      className="px-4 py-2 bg-accent text-ink rounded-xl text-sm font-bold disabled:opacity-40"
                    >
                      {creating ? '…' : 'Create'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setShowCreateInput(false); setNewFolderName(''); }}
                    className="text-xs text-gray-500 w-full text-center py-1"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCreateInput(true)}
                  className="w-full bg-accent text-ink py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 active:opacity-80"
                >
                  <span className="text-lg font-black">+</span> New Folder Here
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
