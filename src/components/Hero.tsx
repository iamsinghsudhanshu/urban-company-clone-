import React, { useEffect, useState } from 'react';

const images = [
  "https://media.istockphoto.com/id/1272134888/photo/two-mechanic-using-circular-saw-grinder-at-factory.jpg?s=1024x1024&w=is&k=20&c=dlZlMyINXa4AcUCrff-tbcL_qitxeE-mjogWg60DJ6c=",
  "https://media.istockphoto.com/id/1312114883/photo/mature-painter-painting-a-wall.jpg?s=1024x1024&w=is&k=20&c=L_-aqVnmQzGnQawrwU4lfUMg_ur0qIduluHuiaDzmfY=",
  "https://media.istockphoto.com/id/1464816116/photo/black-female-technician-service-open-air-conditioner-indoor-for-checking-and-repairing.jpg?s=1024x1024&w=is&k=20&c=y-2ScrHfdx7rCPu48BY0WVZ8zzGn7g9Ye_XDgNUNRTs=",
  "https://media.istockphoto.com/id/1336348648/photo/couple-massage-at-spa-resort-beautiful-couple-getting-a-back-massage-outdoor-romantic-weekend.jpg?s=1024x1024&w=is&k=20&c=bIKCDc81tXVa9qBU9XaR0XjyV05G5bvrFvB7MqF65NU=",
  "https://media.istockphoto.com/id/590277932/photo/nothing-is-better-than-team-work.jpg?s=1024x1024&w=is&k=20&c=lMIeO5flI-N-D7ZBTXv0-5FCjq6JCZHNSq-zBn5tT28=",
];

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[500px] mt-16 overflow-hidden">
      <img
        src={images[currentIndex]}
        alt={`Service ${currentIndex + 1}`}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 opacity-100"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black bg-opacity-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center z-10">
        <div className="text-white">
          <h1 className="text-5xl font-bold mb-4">Quality Home Services</h1>
          <p className="text-xl mb-8">Book trusted professionals for all your home needs</p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
