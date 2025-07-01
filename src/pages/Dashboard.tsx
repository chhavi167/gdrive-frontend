import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getToken } from '../api/auth';
import { useState } from 'react';
import { useRouter } from '@tanstack/react-router';

// const app_url = 'http://localhost:3000/api/files';
const api_url = 'https://gdrive-backend-17wp.onrender.com/api';

interface FileType {
  id: string;
  name: string;
  url: string;
  createdAt: string;
  accessList: { email: string }[];
  ownerId: string;
  owner?: { email: string }; // for shared files
}

// Fetch owned files
const fetchFiles = async (): Promise<FileType[]> => {
  const res = await fetch(`${api_url}/files/my-files`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error('Failed to load files');
  return res.json();
};

// Fetch shared-with-me files
const fetchSharedFiles = async (): Promise<FileType[]> => {
  const res = await fetch(`${api_url}/files/shared-with-me`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error('Failed to load shared files');
  return res.json();
};

const Dashboard = () => {
  const queryClient = useQueryClient();
  const { navigate } = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [section, setSection] = useState<'my' | 'shared'>('my'); 

  const { data = [] } = useQuery({
    queryKey: ['files'],
    queryFn: fetchFiles,
  });

  const {
    data: sharedFiles = [],
  } = useQuery({
    queryKey: ['shared-files'],
    queryFn: fetchSharedFiles,
  });
 


const handleLogout = () => {
  localStorage.removeItem('token');
  navigate({ to: '/' });
};


  // Upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Please select a file');
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${api_url}/files/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    });
    if (res.ok) {
      alert('File uploaded!');
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ['files'] });
    } else {
      alert('Upload failed');
    }
  };

  // Delete
  const deleteFile = async (id: string) => {
    const res = await fetch(`${api_url}/files/delete/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error('Delete failed');
    return res.json();
  };
  const deleteMutation = useMutation({
    mutationFn: deleteFile,
    onSuccess: () => {
      alert('File deleted');
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });

  // Rename
  const renameFile = async ({ id, newName }: { id: string; newName: string }) => {
    const res = await fetch(`${api_url}/files/rename/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ newName }),
    });
    if (!res.ok) throw new Error('Rename failed');
    return res.json();
  };
  const renameMutation = useMutation({
    mutationFn: renameFile,
    onSuccess: () => {
      alert('Renamed!');
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });

  // Share
  const shareFile = async ({ id, userEmails }: { id: string; userEmails: string[] }) => {
    const res = await fetch(`${api_url}/files/share/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ userEmails }),
    });
    if (!res.ok) throw new Error('Share failed');
    return res.json();
  };
  const shareMutation = useMutation({
    mutationFn: shareFile,
    onSuccess: () => {
      alert('File shared!');
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
return (
  <div className="flex h-screen bg-gray-100  bg-linear-to-r/srgb from-pink-100 to-blue-200">
    {/* Sidebar */}
    <aside className="w-64 bg-white p-5 shadow-md ">
      <h1 className="text-xl font-bold mb-6">Drive Clone</h1>
     
        <div>
        <nav className="space-y-2">
        <button
          onClick={() => setSection('my')}
          className={`w-full text-left px-3 py-2 rounded ${
            section === 'my' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'
          }`}
        >
           My Drive
        </button>
        <button
          onClick={() => setSection('shared')}
          className={`w-full text-left px-3 py-2 rounded ${
            section === 'shared' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'
          }`}
        >
          Shared with Me
        </button>
      </nav>
        </div>
        <div className="p-3 mt-140">
      <button
        onClick={handleLogout}
        className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600">Logout
        </button>
      </div>
     
      
      
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-y-auto p-6 ">
      {section === 'my' && (
        <>
          <h2 className="text-2xl font-bold mb-4">My Drive</h2>

          {/* Upload */}
          <form onSubmit={handleUpload} className="mb-6 flex gap-3 items-center">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="border rounded px-2 py-1"
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">
              Upload
            </button>
          </form>

          {/* File List */}
          <ul className="space-y-4 min-w-200 ml-2 ">
            {data.map((file) => (
              <li
                key={file.id}
                className="bg-white p-4 rounded shadow flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(file.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white bg-lime-600 hover:bg-lime-800 font-medium rounded text-sm px-5 py-2.5"
                  >
                    View
                  </a>
                  <button
                    onClick={() => window.open(file.url, '_blank')}
                    className="text-sm px-2 py-1 bg-blue-500 hover:bg-blue-800 text-white rounded"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => {
                      const newName = prompt('Enter new name:', file.name);
                      if (newName) renameMutation.mutate({ id: file.id, newName });
                    }}
                    className="text-sm px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(file.id)}
                    className="text-sm px-2 py-1 bg-red-500 hover:bg-red-700 text-white rounded"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      const emails = prompt('Enter emails to share (comma separated):');
                      if (emails) {
                        const userEmails = emails.split(',').map((e) => e.trim());
                        shareMutation.mutate({ id: file.id, userEmails });
                      }
                    }}
                    className="text-sm px-2 py-1 bg-purple-500 hover:bg-purple-800 text-white rounded"
                  >
                    Share
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {section === 'shared' && (
        <>
          <h2 className="text-2xl font-bold mb-4">Shared with Me</h2>
          {sharedFiles.length === 0 ? (
            <p>No files shared with you.</p>
          ) : (
            <ul className="space-y-4 ml-2">
              {sharedFiles.map((file) => (
                <li
                  key={file.id}
                  className="bg-gray-100 p-4 rounded shadow flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-gray-800">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      Shared by {file.owner?.email || 'Unknown'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white bg-lime-700 hover:bg-lime-800 font-medium rounded text-sm px-5 py-2.5"
                    >
                      View
                    </a>
                    <button
                      onClick={() => window.open(file.url, '_blank')}
                      className="text-sm px-2 py-1 bg-blue-500 hover:bg-blue-800 text-white rounded"
                    >
                      Download
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  </div>
);
};

export default Dashboard;
