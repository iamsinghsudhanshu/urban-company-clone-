import React, { useState, useEffect } from 'react';
import { Star, Calendar, Clock, Phone, MapPin } from 'lucide-react';
import BookingModal from './BookingModal';

interface ServiceCardProps {
  title: string;
  image: string;
  rating: number;
  price: string;
  description: string;
  provider: {
    name: string;
    phone: string;
    availability: string[];
    location: string;
  };
}

// Cache for geocoding results
const geocodeCache: Record<string, { lat: number; lon: number }> = {};

// Rate limiting with exponential backoff
let lastGeocodingCall = 0;
const MIN_DELAY = 1000; // 1 second
const MAX_DELAY = 5000; // 5 seconds
let currentDelay = MIN_DELAY;

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const ServiceCard: React.FC<ServiceCardProps> = ({ 
  title, 
  image, 
  rating, 
  price, 
  description,
  provider 
}) => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [distance, setDistance] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    let isMounted = true;
    let retryTimeout: NodeJS.Timeout;

    const getGeocodingWithRetry = async (address: string): Promise<{ lat: number; lon: number } | null> => {
      try {
        const now = Date.now();
        const timeToWait = Math.max(0, currentDelay - (now - lastGeocodingCall));
        
        if (timeToWait > 0) {
          await new Promise(resolve => setTimeout(resolve, timeToWait));
        }

        lastGeocodingCall = Date.now();
        
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
          {
            headers: {
              'User-Agent': 'UrbanCompanyClone/1.0',
              'Accept-Language': 'en-US,en;q=0.9'
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.length > 0) {
          // Reset delay on success
          currentDelay = MIN_DELAY;
          return {
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon)
          };
        }
        return null;
      } catch (error) {
        // Increase delay on error (exponential backoff)
        currentDelay = Math.min(currentDelay * 2, MAX_DELAY);
        throw error;
      }
    };

    const updateDistance = async () => {
      if (!navigator.geolocation) return;

      try {
        // Try to get cached coordinates first
        if (geocodeCache[provider.location] && retryCount === 0) {
          const coords = geocodeCache[provider.location];
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });

          const d = calculateDistance(
            position.coords.latitude,
            position.coords.longitude,
            coords.lat,
            coords.lon
          );

          if (isMounted) {
            setDistance(d < 1 ? `${(d * 1000).toFixed(0)}m` : `${d.toFixed(1)}km`);
          }
          return;
        }

        // Get user's position
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        // Get provider's coordinates
        const providerCoords = await getGeocodingWithRetry(provider.location);
        
        if (providerCoords && isMounted) {
          // Cache the result
          geocodeCache[provider.location] = providerCoords;

          const d = calculateDistance(
            position.coords.latitude,
            position.coords.longitude,
            providerCoords.lat,
            providerCoords.lon
          );

          setDistance(d < 1 ? `${(d * 1000).toFixed(0)}m` : `${d.toFixed(1)}km`);
          setRetryCount(0); // Reset retry count on success
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        
        // Retry logic
        if (retryCount < MAX_RETRIES && isMounted) {
          setRetryCount(prev => prev + 1);
          retryTimeout = setTimeout(() => {
            updateDistance();
          }, currentDelay);
        }
      }
    };

    updateDistance();

    return () => {
      isMounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [provider.location, retryCount]);

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <img src={image} alt={title} className="w-full h-48 object-cover" />
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <div className="flex items-center mb-2">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="ml-1 text-sm text-gray-600">{rating}</span>
          </div>
          <p className="text-gray-600 text-sm mb-2">{description}</p>
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span>{provider.availability.join(' • ')}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{provider.location}</span>
              {distance && (
                <span className="ml-2 text-blue-600">({distance} away)</span>
              )}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              <span>{provider.phone}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-blue-600 font-semibold">Starts from {price}</p>
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        service={{
          title,
          price,
          provider
        }}
      />
    </>
  );
};

export default ServiceCard;