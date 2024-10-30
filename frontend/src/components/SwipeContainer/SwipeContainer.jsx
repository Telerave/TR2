import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';

const SwipeContainer = ({ tracks }) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const handlers = useSwipeable({
    onSwipedUp: () => {
      setCurrentTrackIndex((prevIndex) => 
        prevIndex < tracks.length - 1 ? prevIndex + 1 : prevIndex
      );
    },
    onSwipedDown: () => {
      setCurrentTrackIndex((prevIndex) => 
        prevIndex > 0 ? prevIndex - 1 : prevIndex
      );
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  return (
    <div {...handlers} style={{ height: '100vh', overflow: 'hidden' }}>
      <h2>Текущий трек: {tracks[currentTrackIndex]}</h2>
      <p>Свайпните вверх или вниз для переключения треков</p>
    </div>
  );
};

export default SwipeContainer;