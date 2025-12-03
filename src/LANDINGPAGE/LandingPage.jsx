import React, { useState, useEffect } from 'react';
import Login from '../AUTHENTICATION/Login';
import Register from '../AUTHENTICATION/Register';

import sock1 from '../assets/socks 1.jpg';
import sock2 from '../assets/socks 2.jpg';
import sock3 from '../assets/socks 3.jpg';
import happyLogo from '../assets/happy.png';

const LandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [modalType, setModalType] = useState(null); // 'login' or 'register'

  const slides = [sock1, sock2, sock3];

  // Auto-rotate carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black m-0 p-0">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 px-6 py-6 md:px-12 md:py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 md:h-11 md:w-11 rounded-full bg-white/90 flex items-center justify-center shadow-md overflow-hidden">
              <img
                src={happyLogo}
                alt="Happy Toes logo"
                className="h-8 w-8 md:h-9 md:w-9 object-contain"
              />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-2xl md:text-3xl font-bold text-white tracking-tight drop-shadow-lg">
                Happy Toes
              </span>
              <span className="text-xs md:text-sm text-white/80 tracking-wide drop-shadow">
                Premium Socks
              </span>
            </div>
          </div>
          <button
            onClick={() => setModalType('login')}
            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-lg"
          >
            Login
          </button>
        </div>
      </header>

      {/* Carousel */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
          >
            <img
              src={slide}
              alt={`Sock collection ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 p-3 md:p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all transform hover:scale-110 active:scale-95"
          aria-label="Previous slide"
        >
          <svg
            className="w-6 h-6 md:w-8 md:h-8 text-white"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 p-3 md:p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all transform hover:scale-110 active:scale-95"
          aria-label="Next slide"
        >
          <svg
            className="w-6 h-6 md:w-8 md:h-8 text-white"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M9 5l7 7-7 7"></path>
          </svg>
        </button>

        {/* Navigation Dots */}
        <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-10 flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all ${index === currentSlide
                ? 'w-12 h-3 bg-orange-500'
                : 'w-3 h-3 bg-white/50 hover:bg-white/80'
                } rounded-full`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Content Overlay - Centered */}
        <div className="absolute inset-0 z-10 flex items-center justify-center px-4 sm:px-6 md:px-12">
          <div className="text-center text-white max-w-4xl w-full">
            <div className="inline-block px-4 py-1.5 bg-orange-500/90 backdrop-blur-sm rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
              Premium Comfort
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 leading-tight drop-shadow-lg px-2">
              Happy socks for happier toes
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-5 sm:mb-6 max-w-2xl mx-auto drop-shadow-md px-4">
              Cloud-soft, breathable, and designed to stay in place from first step to last.
            </p>
            <button className="px-6 sm:px-8 py-3 sm:py-3.5 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 active:scale-95 shadow-xl text-sm sm:text-base">
              Shop Now
            </button>
          </div>
        </div>
      </div>


      {/* Authentication Modals */}
      {modalType === 'login' && (
        <Login
          onClose={() => setModalType(null)}
          onSwitchToRegister={() => setModalType('register')}
          onLoginSuccess={(isAdmin) => {
            setModalType(null);
            // Redirect based on admin status
            window.location.href = isAdmin ? '/admin' : '/dashboard';
          }}
        />
      )}

      {modalType === 'register' && (
        <Register
          onClose={() => setModalType(null)}
          onSwitchToLogin={() => setModalType('login')}
          onRegisterSuccess={() => {
            setModalType('login');
            // You can show a success message here if needed
          }}
        />
      )}

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
