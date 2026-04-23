

import { useEffect, useRef } from 'react';

interface ErrorPageProps {
  code?: string | number;
  title?: string;
  message?: string;
}

export default function ErrorPage({ 
  code = "404", 
  title = "Oops! Page Not Found", 
  message = "The page you're looking for has vanished into the digital void. Don't worry, let's get you back on track." 
}: ErrorPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create floating particles
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'absolute w-1 h-1 bg-red-400/50 rounded-full animate-pulse';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.animation = `float ${3 + Math.random() * 4}s ease-in-out infinite`;
      
      container.appendChild(particle);

      setTimeout(() => particle.remove(), 7000);
    };

    // Create particles periodically
    const particleInterval = setInterval(createParticle, 300);

    return () => clearInterval(particleInterval);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden flex items-center justify-center">
      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse"
          style={{
            top: '-10%',
            left: '10%',
            animation: 'float 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse"
          style={{
            bottom: '-10%',
            right: '10%',
            animation: 'float 10s ease-in-out infinite reverse',
          }}
        />
        <div ref={orbRef} className="absolute inset-0" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 py-12 text-center max-w-2xl">
        {/* Animated error icon */}
        <div className="mb-8 inline-block">
          <div className="relative w-32 h-32">
            {/* Outer rotating ring */}
            <div
              className="absolute inset-0 border-4 border-transparent border-t-red-500 border-r-orange-500 rounded-full animate-spin"
              style={{ animationDuration: '3s' }}
            />

            {/* Inner pulsing circle */}
            <div className="absolute inset-4 bg-gradient-to-br from-red-500/30 to-orange-500/30 rounded-full blur-xl animate-pulse" />

            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-16 h-16 text-red-500 drop-shadow-lg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
                style={{
                  animation: 'bounce 2s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite',
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c.866 1.5 2.926 2.875 5.303 2.875s4.437-1.375 5.303-2.875M21 20a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Error code */}
        <div className="mb-4">
          <h1
            className="text-8xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-red-500 bg-clip-text text-transparent mb-2"
            style={{
              animation: 'fadeInDown 0.8s ease-out',
            }}
          >
            {code}
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mx-auto" />
        </div>

        {/* Error message */}
        <div
          style={{
            animation: 'fadeInUp 0.8s ease-out 0.2s both',
          }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-3">
            {title}
          </h2>
          <p className="text-lg text-slate-400 mb-8 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Action buttons */}
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          style={{
            animation: 'fadeInUp 0.8s ease-out 0.4s both',
          }}
        >
          <button
            onClick={() => window.location.href = '/'}
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-lg shadow-lg shadow-red-900/20 transition-all duration-300 hover:scale-105 hover:shadow-red-900/40 active:scale-95"
          >
            Back to Home
          </button>
          <button
            onClick={() => window.history.back()}
            className="px-8 py-3 border-2 border-slate-500 text-slate-300 font-semibold rounded-lg transition-all duration-300 hover:border-slate-300 hover:text-slate-100 hover:bg-slate-800/50"
          >
            Go Back
          </button>
        </div>

        {/* Decorative elements */}
        <div
          className="mt-12 flex justify-center gap-2"
          style={{
            animation: 'fadeIn 1s ease-out 0.6s both',
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-red-500/40 rounded-full"
              style={{
                animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
