import React from 'react';
import './TrackList.css';

const TrackList = ({ tracks }) => {
  if (!tracks || tracks.length === 0) {
    return <div>Нет доступных треков</div>;
  }

  return (
    <div className="tracks-container">
      {tracks.map((track) => (
        <div key={track.id} className="track-card">
          {track.imageFile && (
            <img 
              src={`http://localhost:3000${track.imageFile}`} 
              alt={track.title}
              className="track-image"
            />
          )}
          <h3>{track.title}</h3>
          <audio 
            controls
            preload="metadata"
            src={`http://localhost:3000${track.audioFile}`}
          >
            Your browser does not support the audio element.
          </audio>
        </div>
      ))}
    </div>
  );
};

export default TrackList;
