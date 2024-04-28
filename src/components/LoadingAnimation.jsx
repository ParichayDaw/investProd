import React, { useState, useEffect } from 'react';
import Lottie from '@lottiefiles/react-lottie-player';

const LoadingAnimation = () => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    import('./loadingAnimation.json')
      .then((data) => setAnimationData(data.default))
      .catch((error) => console.error('Error loading animation:', error));
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      {animationData && (
        <Lottie
          loop
          animationData={animationData}
          play
          style={{ width: 200, height: 200 }} // Adjust width and height as needed
        />
      )}
    </div>
  );
};

export default LoadingAnimation;
