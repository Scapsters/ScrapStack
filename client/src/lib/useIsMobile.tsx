import { useState, useEffect } from 'react';

// Written by AI
const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Initial check
    checkMobile();

    // Event listener for window resize
    window.addEventListener('resize', checkMobile);

    // Cleanup the event listener on unmount
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [breakpoint]); // Re-run effect if breakpoint changes

  return isMobile;
};

export default useIsMobile;