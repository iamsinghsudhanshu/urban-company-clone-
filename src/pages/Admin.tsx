import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Edit, Trash2, Plus, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Provider {
  id: string;
  name: string;
  phone: string;
  location: string;
  services: string[];
  availability: string[];
  image?: string;
}

const Admin: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email === 'admin@urbancompany.com') {
        setIsAuthenticated(true);
        fetchProviders();
      } else {
        setIsAuthenticated(false);
        navigate('/login');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .order('name');

      if (error) throw error;
      setProviders(data || []);
    } catch (error: any) {
      console.error('Error fetching providers:', error);
      toast.error('Failed to load providers: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProvider = () => {
    setEditingProvider({
      id: '',
      name: '',
      phone: '',
      location: '',
      services: [],
      availability: [],
      image: ''
    });
  };

  const handleDeleteProvider = async (id: string) => {
    if (!confirm('Are you sure you want to delete this provider?')) return;

    try {
      const { error } = await supabase
        .from('providers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProviders(providers.filter(provider => provider.id !== id));
      toast.success('Provider deleted successfully');
    } catch (error: any) {
      console.error('Error deleting provider:', error);
      toast.error('Failed to delete provider: ' + error.message);
    }
  };

  const handleSaveProvider = async () => {
    if (!editingProvider) return;
    
    try {
      if (editingProvider.id) {
        // Update existing provider
        const { error } = await supabase
          .from('providers')
          .update({
            name: editingProvider.name,
            phone: editingProvider.phone,
            location: editingProvider.location,
            services: editingProvider.services,
            availability: editingProvider.availability,
            image: editingProvider.image
          })
          .eq('id', editingProvider.id);

        if (error) throw error;
        
        setProviders(providers.map(p => 
          p.id === editingProvider.id ? editingProvider : p
        ));
        
        toast.success('Provider updated successfully');
      } else {
        // Create new provider
        const { data, error } = await supabase
          .from('providers')
          .insert({
            name: editingProvider.name,
            phone: editingProvider.phone,
            location: editingProvider.location,
            services: editingProvider.services,
            availability: editingProvider.availability,
            image: editingProvider.image
          })
          .select();

        if (error) throw error;
        
        setProviders([...providers, data[0]]);
        toast.success('Provider added successfully');
      }
      
      setEditingProvider(null);
    } catch (error: any) {
      console.error('Error saving provider:', error);
      toast.error('Failed to save provider: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Service Providers</h2>
        <div className="flex space-x-4">
          <button
            onClick={handleAddProvider}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Provider
          </button>
          <button
            onClick={() => navigate('/admin-dashboard')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            View Dashboard
          </button>
        </div>
      </div>

      {editingProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                {editingProvider.id ? 'Edit Provider' : 'Add Provider'}
              </h3>
              <button
                onClick={() => {
                  setEditingProvider(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider Name
                </label>
                <input
                  type="text"
                  value={editingProvider.name}
                  onChange={(e) => setEditingProvider({
                    ...editingProvider,
                    name: e.target.value
                  })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editingProvider.phone}
                  onChange={(e) => setEditingProvider({
                    ...editingProvider,
                    phone: e.target.value
                  })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={editingProvider.location}
                  onChange={(e) => setEditingProvider({
                    ...editingProvider,
                    location: e.target.value
                  })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Services (comma separated)
                </label>
                <input
                  type="text"
                  value={editingProvider.services.join(', ')}
                  onChange={(e) => setEditingProvider({
                    ...editingProvider,
                    services: e.target.value.split(',').map(s => s.trim())
                  })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Availability (comma separated)
                </label>
                <input
                  type="text"
                  value={editingProvider.availability.join(', ')}
                  onChange={(e) => setEditingProvider({
                    ...editingProvider,
                    availability: e.target.value.split(',').map(a => a.trim())
                  })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="p-4 border-t flex justify-end space-x-4">
              <button
                onClick={() => {
                  setEditingProvider(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProvider}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Save className="h-5 w-5 mr-2" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Services
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Availability
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {providers.map((provider) => (
              <tr key={provider.id}>
                <td className="px-6 py-4 whitespace-nowrap">{provider.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{provider.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap">{provider.location}</td>
                <td className="px-6 py-4 whitespace-nowrap">{provider.services.join(', ')}</td>
                <td className="px-6 py-4 whitespace-nowrap">{provider.availability.join(', ')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => setEditingProvider(provider)}
                    className="text-blue-600 hover:text-blue-700 mr-4"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteProvider(provider.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;
