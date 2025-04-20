import React, { useState, useEffect } from 'react';
import { X, Search, MapPin, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: { address: string; lat: number; lng: number }) => void;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center);
  return null;
}

const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose, onSelectLocation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [center, setCenter] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState('Searching your location...');
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Get user's approximate location on modal open
  useEffect(() => {
    if (!isOpen) return;

    const getApproximateLocation = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // First try: High accuracy GPS (may fail if permissions denied)
        const gpsSuccess = await new Promise<boolean>(resolve => {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const coords: [number, number] = [
                position.coords.latitude,
                position.coords.longitude
              ];
              await updateLocation(coords);
              resolve(true);
            },
            () => resolve(false),
            { enableHighAccuracy: true, timeout: 5000 }
          );
        });

        // Fallback: IP-based location if GPS fails
        if (!gpsSuccess) {
          const ipResponse = await fetch('https://ipapi.co/json/');
          const ipData = await ipResponse.json();
          const coords: [number, number] = [ipData.latitude, ipData.longitude];
          await updateLocation(coords);
        }
      } catch (err) {
        console.error('Location error:', err);
        setError('Could not determine your location. Please search manually.');
        // Fallback to Delhi coordinates
        const fallbackCoords: [number, number] = [28.6139, 77.2090];
        setCenter(fallbackCoords);
        setMarkerPosition(fallbackCoords);
        setAddress('Delhi, India (default)');
      } finally {
        setIsLoading(false);
      }
    };

    const updateLocation = async (coords: [number, number]) => {
      setCenter(coords);
      setMarkerPosition(coords);
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        setAddress(data.display_name || 'Your current location');
        setSearchQuery(data.display_name || '');
      } catch (err) {
        setAddress(`Near ${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`);
      }
    };

    getApproximateLocation();
  }, [isOpen]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1`
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newCoords: [number, number] = [parseFloat(lat), parseFloat(lon)];
        setCenter(newCoords);
        setMarkerPosition(newCoords);
        setAddress(display_name);
      }
    } catch (error) {
      setError('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Select Location</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search Box */}
        <div className="p-4 border-b">
          <div className="relative">
            <input
              type="text"
              placeholder="Search location..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            {isLoading && (
              <Loader2 className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 animate-spin" />
            )}
          </div>

          <button
            onClick={async () => {
              setIsLoading(true);
              try {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                  navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000
                  });
                });
                const coords: [number, number] = [
                  position.coords.latitude,
                  position.coords.longitude
                ];
                setCenter(coords);
                setMarkerPosition(coords);
              } catch (err) {
                setError('Failed to get precise location. Try searching instead.');
              } finally {
                setIsLoading(false);
              }
            }}
            className="mt-3 flex items-center text-blue-600 hover:text-blue-700 text-sm"
            disabled={isLoading}
          >
            <MapPin className="h-4 w-4 mr-2" />
            {isLoading ? 'Detecting...' : 'Use precise GPS location'}
          </button>
        </div>

        {/* Map Area */}
        <div className="flex-1 min-h-[300px] relative">
          {isLoading && !center ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-red-500">
              {error}
            </div>
          ) : center ? (
            <>
              <MapContainer
                center={center}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {markerPosition && <Marker position={markerPosition} />}
                <ChangeView center={center} />
              </MapContainer>
              <div className="absolute bottom-2 left-2 right-2 bg-white p-2 rounded shadow text-sm">
                {address || 'Location selected'}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t flex justify-between items-center">
          <span className="text-sm text-gray-600 truncate max-w-[60%]">
            {address || 'No location selected'}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (!markerPosition) return;
                onSelectLocation({
                  address: address || searchQuery || 'Selected location',
                  lat: markerPosition[0],
                  lng: markerPosition[1],
                });
                onClose();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
              disabled={!markerPosition}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
