import React, { useState, useEffect, useRef } from 'react';
import ReactHowler from 'react-howler';
import styled from 'styled-components';

const PlayerWrapper = styled.div`
  // ... существующие стили ...
`;

const Button = styled.button`
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 14px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 5px;
`;

const TrackPlayer = ({ currentTrack, onNextTrack }) => {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const playerRef = useRef(null);

  useEffect(() => {
    if (playing) {
      // Плавное уменьшение громкости
      const fadeOut = setInterval(() => {
        setVolume((prevVolume) => {
          const newVolume = prevVolume - 0.1;
          return newVolume > 0 ? newVolume : 0;
        });
      }, 100);

      // Остановка fade out и переход к следующему треку
      setTimeout(() => {
        clearInterval(fadeOut);
        onNextTrack();
        setVolume(1);
      }, 1000);
    }
  }, [currentTrack, playing, onNextTrack]);

  const togglePlay = () => {
    setPlaying(!playing);
  };

  return (
    <PlayerWrapper>
      {currentTrack && currentTrack.url && (
        <ReactHowler
          src={currentTrack.url}
          playing={playing}
          volume={volume}
          ref={playerRef}
        />
      )}
      <h2>{currentTrack.title}</h2>
      <p>{currentTrack.artist}</p>
      <Button onClick={togglePlay}>{playing ? 'Пауза' : 'Играть'}</Button>
      <Button onClick={onNextTrack}>Следующий трек</Button>
    </PlayerWrapper>
  );
};

export default TrackPlayer;
