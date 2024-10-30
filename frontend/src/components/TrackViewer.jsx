import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { API_ENDPOINTS, AUDIO_BASE_URL } from '../config/api';
import './TrackViewer.css';

const WHEEL_TIMEOUT = 1000;
const WHEEL_THRESHOLD = 50;
const SLIDE_DURATION = 400;

const TrackViewer = () => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [nextTrack, setNextTrack] = useState(null);
  const [prevTrack, setPrevTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [slideDirection, setSlideDirection] = useState(0);
  const audioRef = useRef(new Audio());
  const isAnimating = useRef(false);
  const lastWheelTime = useRef(0);
  const touchStartY = useRef(0);

  const formatUrl = useMemo(() => (path) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `${AUDIO_BASE_URL}${path}`;
  }, []);

  const formatTrackData = useMemo(() => (data) => {
    if (!data) return null;
    return {
      ...data,
      audioFile: formatUrl(data.audioFile),
      imageFile: formatUrl(data.imageFile)
    };
  }, [formatUrl]);

  const preloadImage = useCallback((src) => {
    if (!src) return;
    const img = new Image();
    img.src = src;
  }, []);

  useEffect(() => {
    if (nextTrack?.imageFile) {
      preloadImage(nextTrack.imageFile);
    }
    if (prevTrack?.imageFile) {
      preloadImage(prevTrack.imageFile);
    }
  }, [nextTrack, prevTrack, preloadImage]);

  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: sessionData } = await axios.post(API_ENDPOINTS.createSession);
        setSessionId(sessionData.sessionId);
        const { data: trackData } = await axios.get(API_ENDPOINTS.getNextTrack(sessionData.sessionId));
        setCurrentTrack(formatTrackData(trackData));
      } catch (error) {
        console.error('Session init error:', error);
      }
    };

    if (!sessionId) {
      initSession();
    }
  }, [sessionId, formatTrackData]);

  useEffect(() => {
    if (currentTrack) {
      audioRef.current.src = currentTrack.audioFile;
      isPlaying ? audioRef.current.play().catch(console.error) : audioRef.current.pause();
    }
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    return () => {
      audioRef.current.pause();
      audioRef.current.src = '';
    };
  }, []);

  const handleTrackChange = useCallback(async (direction) => {
    if (!sessionId || isAnimating.current) return;
    
    const now = Date.now();
    if (now - lastWheelTime.current < WHEEL_TIMEOUT) return;
    
    isAnimating.current = true;
    lastWheelTime.current = now;
    
    try {
      const { data } = await axios.get(
        direction > 0 ? API_ENDPOINTS.getNextTrack(sessionId) : API_ENDPOINTS.getPrevTrack(sessionId)
      );

      const formattedData = formatTrackData(data);

      if (direction > 0) {
        setNextTrack(formattedData);
        setPrevTrack(null);
      } else {
        setPrevTrack(formattedData);
        setNextTrack(null);
      }

      setSlideDirection(direction);
      setTimeout(() => {
        setCurrentTrack(formattedData);
        setSlideDirection(0);
        isAnimating.current = false;
      }, SLIDE_DURATION);
    } catch (error) {
      console.error('Track change error:', error);
      isAnimating.current = false;
    }
  }, [sessionId, formatTrackData]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = Math.abs(e.deltaY);
    
    if (delta < WHEEL_THRESHOLD) return;
    
    const direction = e.deltaY > 0 ? 1 : -1;
    handleTrackChange(direction);
  }, [handleTrackChange]);

  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const direction = touchEndY > touchStartY.current ? -1 : 1;
    handleTrackChange(direction);
  }, [handleTrackChange]);

  if (!currentTrack) return <div>Loading...</div>;

  return (
    <div 
      className="viewer-container"
      onWheel={handleWheel}
      style={{ touchAction: 'none' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="track-slide">
        <div className="tracks-container" style={{
          transform: `translateY(${slideDirection * -50}%)`,
          transition: slideDirection !== 0 ? 'transform 0.4s cubic-bezier(0.33, 1, 0.68, 1)' : 'none'
        }}>
          {prevTrack && slideDirection < 0 && (
            <div className="track-wrapper">
              <img 
                src={prevTrack.imageFile}
                alt={prevTrack.title}
                className="track-image"
                onError={(e) => {
                  console.error('Image load error:', {
                    src: e.target.src,
                    track: prevTrack
                  });
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <div className="track-wrapper">
            <img 
              src={currentTrack.imageFile}
              alt={currentTrack.title}
              className="track-image"
            />
          </div>
          
          {nextTrack && slideDirection > 0 && (
            <div className="track-wrapper">
              <img 
                src={nextTrack.imageFile}
                alt={nextTrack.title}
                className="track-image"
              />
            </div>
          )}
        </div>

        <button className="play-pause-button" onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? (
            <div className="pause-icon">
              <div className="pause-bar" />
              <div className="pause-bar" />
            </div>
          ) : (
            <div className="play-icon" />
          )}
        </button>
        
        <div className="track-info">
          <h2>{currentTrack.title}</h2>
        </div>
      </div>
    </div>
  );
};

export default TrackViewer;