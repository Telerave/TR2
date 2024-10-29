import sys
import json
import librosa
import numpy as np

def analyze_audio(file_path):
    # Загрузка аудиофайла
    y, sr = librosa.load(file_path)
    
    # Извлечение характеристик
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    chroma = librosa.feature.chroma_stft(y=y, sr=sr)
    spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)
    
    # Подготовка результатов
    results = {
        "tempo": float(tempo),
        "chroma_mean": float(np.mean(chroma)),
        "spectral_centroid_mean": float(np.mean(spectral_centroids))
    }
    
    return json.dumps(results)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
        print(analyze_audio(file_path))
    else:
        print(json.dumps({"error": "Не указан путь к аудиофайлу"}))
