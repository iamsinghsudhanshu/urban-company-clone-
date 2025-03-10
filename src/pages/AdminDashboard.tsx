import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart, PieChart, Users, Calendar, CheckCircle, Clock, XCircle, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

interface Booking {
  id: string;
  created_at: string;
  service_title: string;
  service_price: string;
  booking_date: string;
  booking_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  provider_name: string;
  provider_phone: string;
  provider_location: string;
  user_id: string;
  payment_method: 'card' | 'qr' | 'cod';
  delivery_address: string | null;
}

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
}

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  totalUsers: number;
  bookingsByDate: Record<string, number>;
  bookingsByService: Record<string, number>;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bookings' | 'users'>('dashboard');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    totalUsers: 0,
    bookingsByDate: {},
    bookingsByService: {}
  });
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;
      
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*');

      if (usersError) throw usersError;
      
      // Set data
      setBookings(bookingsData || []);
      setUsers(usersData || []);
      
      // Calculate stats
      calculateStats(bookingsData || [], usersData || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (bookingsData: Booking[], usersData: User[]) => {
    const newStats: DashboardStats = {
      totalBookings: bookingsData.length,
      pendingBookings: bookingsData.filter(b => b.status === 'pending').length,
      confirmedBookings: bookingsData.filter(b => b.status === 'confirmed').length,
      completedBookings: bookingsData.filter(b => b.status === 'completed').length,
      cancelledBookings: bookingsData.filter(b => b.status === 'cancelled').length,
      totalRevenue: bookingsData.reduce((sum, booking) => {
        const price = parseInt(booking.service_price.replace('₹', '')) || 0;
        return sum + price;
      }, 0),
      totalUsers: usersData.length,
      bookingsByDate: {},
      bookingsByService: {}
    };

    // Calculate bookings by date
    bookingsData.forEach(booking => {
      const date = new Date(booking.created_at).toLocaleDateString();
      newStats.bookingsByDate[date] = (newStats.bookingsByDate[date] || 0) + 1;
      
      // Calculate bookings by service
      const service = booking.service_title;
      newStats.bookingsByService[service] = (newStats.bookingsByService[service] || 0) + 1;
    });

    setStats(newStats);
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      setUpdatingStatus(true);
      
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;
      
      // Update local state
      setBookings(bookings.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      ));
      
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
      
      toast.success(`Booking status updated to ${newStatus}`);
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update status: ' + error.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-2xl font-bold mb-8">Admin Dashboard</h2>
      
      <div className="mb-8">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'dashboard'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart className="h-5 w-5 inline-block mr-2" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'bookings'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calendar className="h-5 w-5 inline-block mr-2" />
            Bookings
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'users'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="h-5 w-5 inline-block mr-2" />
            Users
          </button>
        </div>
      </div>
      
      {activeTab === 'dashboard' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-700">Total Bookings</h3>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-3xl font-bold">{stats.totalBookings}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-700">Total Revenue</h3>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-3xl font-bold">₹{stats.totalRevenue}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-700">Total Users</h3>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-700">Completion Rate</h3>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-3xl font-bold">
                {stats.totalBookings > 0
                  ? Math.round((stats.completedBookings / stats.totalBookings) * 100)
                  : 0}%
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Booking Status</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-4 w-4 rounded-full bg-yellow-400 mr-2"></div>
                    <span>Pending</span>
                  </div>
                  <span className="font-medium">{stats.pendingBookings}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-4 w-4 rounded-full bg-blue-400 mr-2"></div>
                    <span>Confirmed</span>
                  </div>
                  <span className="font-medium">{stats.confirmedBookings}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-4 w-4 rounded-full bg-green-400 mr-2"></div>
                    <span>Completed</span>
                  </div>
                  <span className="font-medium">{stats.completedBookings}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-4 w-4 rounded-full bg-red-400 mr-2"></div>
                    <span>Cancelled</span>
                  </div>
                  <span className="font-medium">{stats.cancelledBookings}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Popular Services</h3>
              <div className="space-y-4">
                {Object.entries(stats.bookingsByService)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([service, count], index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="truncate max-w-xs">{service}</span>
                      <span className="font-medium">{count} bookings</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex justify-between items-center border-b pb-4">
                  <div>
                    <p className="font-medium">{booking.service_title}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'bookings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="text-lg font-medium">All Bookings</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.service_title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.provider_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(booking.booking_date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.booking_time}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-blue-600">
                            {booking.service_price}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => setSelectedBooking(booking)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div>
            {selectedBooking ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium mb-4">Booking Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Service</p>
                    <p className="font-medium">{selectedBooking.service_title}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Provider</p>
                    <p className="font-medium">{selectedBooking.provider_name}</p>
                    <p className="text-sm">{selectedBooking.provider_phone}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="font-medium">
                      {new Date(selectedBooking.booking_date).toLocaleDateString()} at {selectedBooking.booking_time}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="font-medium text-blue-600">{selectedBooking.service_price}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p
                      className={`inline-block px-2 py-1 text-sm font-medium rounded-full ${getStatusColor(
                        selectedBooking.status
                      )}`}
                    >
                      {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                    </p>
                  </div>
                  
                  {selectedBooking.delivery_address && (
                    <div>
                      <p className="text-sm text-gray-500">Delivery Address</p>
                      <p className="font-medium">{selectedBooking.delivery_address}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-gray-500">Booked On</p>
                    <p className="font-medium">
                      {new Date(selectedBooking.created_at).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Update Status</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleUpdateStatus(selectedBooking.id, 'pending')}
                        disabled={selectedBooking.status === 'pending' || updatingStatus}
                        className={`px-3 py-1 text-xs rounded-full ${
                          selectedBooking.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 opacity-50 cursor-not-allowed'
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        }`}
                      >
                        <Clock className="h-3 w-3 inline-block mr-1" />
                        Pending
                      </button>
                      
                      <button
                        onClick={() => handleUpdateStatus(selectedBooking.id, 'confirmed')}
                        disabled={selectedBooking.status === 'confirmed' || updatingStatus}
                        className={`px-3 py-1 text-xs rounded-full ${
                          selectedBooking.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800 opacity-50 cursor-not-allowed'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                      >
                        <CheckCircle className="h-3 w-3 inline-block mr-1" />
                        Confirm
                      </button>
                      
                      <button
                        onClick={() => handleUpdateStatus(selectedBooking.id, 'completed')}
                        disabled={selectedBooking.status === 'completed' || updatingStatus}
                        className={`px-3 py-1 text-xs rounded-full ${
                          selectedBooking.status === 'completed'
                            ? 'bg-green-100 text-green-800 opacity-50 cursor-not-allowed'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        <CheckCircle className="h-3 w-3 inline-block mr-1" />
                        Complete
                      </button>
                      
                      <button
                        onClick={() => handleUpdateStatus(selectedBooking.id, 'cancelled')}
                        disabled={selectedBooking.status === 'cancelled' || updatingStatus}
                        className={`px-3 py-1 text-xs rounded-full ${
                          selectedBooking.status === 'cancelled'
                            ? 'bg-red-100 text-red-800 opacity-50 cursor-not-allowed'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        <XCircle className="h-3 w-3 inline-block mr-1" />
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-500">Select a booking to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium">All Users</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bookings
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {user.last_sign_in_at
                          ? new Date(user.last_sign_in_at).toLocaleDateString()
                          : 'Never'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {bookings.filter(b => b.user_id === user.id).length}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;