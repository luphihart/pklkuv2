import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle, AlertCircle, MapPin } from 'lucide-react';

interface Props {
  targetLat?: number;
  targetLng?: number;
  radiusMeter?: number;
  onCapture: (file: File, coords: { lat: number; lng: number }) => void;
  isSubmitting?: boolean;
}

export const CameraCapture: React.FC<Props> = ({
  targetLat,
  targetLng,
  radiusMeter = 50,
  onCapture,
  isSubmitting = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Haversine client-side preview helper
  const calcDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  useEffect(() => {
    // Request GPS Geolocation
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          setCoords({ lat: userLat, lng: userLng });

          if (targetLat && targetLng) {
            const dist = calcDistance(userLat, userLng, targetLat, targetLng);
            setDistance(dist);
          }
        },
        (err) => {
          setErrorMsg(`Gagal mengakses GPS: ${err.message}. Mohon izinkan lokasi di browser.`);
        },
        { enableHighAccuracy: true },
      );
    } else {
      setErrorMsg('Perangkat Anda tidak mendukung Geolocation API.');
    }

    // Start Camera Stream
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 } }, audio: false })
      .then((mediaStream) => {
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      })
      .catch((err) => {
        setErrorMsg(`Gagal mengakses Kamera: ${err.message}. Mohon izinkan akses kamera.`);
      });

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleTakeSnap = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Un-mirror the captured image by drawing mirrored back
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `selfie_${Date.now()}.jpg`, { type: 'image/jpeg' });
          setCapturedFile(file);
        }
      },
      'image/jpeg',
      0.85,
    );
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCapturedFile(null);
  };

  const handleSubmit = () => {
    if (capturedFile && coords) {
      onCapture(capturedFile, coords);
    }
  };

  const isWithinRadius = distance !== null && radiusMeter !== undefined ? distance <= radiusMeter : true;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 max-w-md mx-auto">
      {/* GPS Status Info Card */}
      <div className="mb-4">
        {coords ? (
          <div
            className={`p-3 rounded-xl border flex items-center justify-between text-sm ${
              isWithinRadius
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-xs uppercase tracking-wider">Lokasi Anda Saat Ini</p>
                <p className="text-xs">
                  {distance !== null ? `Jarak ke DUDI: ${distance}m` : `Lat: ${coords.lat.toFixed(4)}, Lng: ${coords.lng.toFixed(4)}`}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white shadow-xs">
              {isWithinRadius ? `✅ Dalam Radius (${radiusMeter}m)` : `❌ Diluar Radius (${radiusMeter}m)`}
            </span>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0" />
            <span>Mendapatkan titik lokasi GPS...</span>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Camera Preview Box */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-3/4 flex items-center justify-center shadow-inner">
        <canvas ref={canvasRef} className="hidden" />

        {!capturedImage ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform scale-x-[-1]"
          />
        ) : (
          <img src={capturedImage} alt="Preview Selfie" className="w-full h-full object-cover" />
        )}

        {/* Shutter Overlay Controls */}
        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center space-x-4 px-4">
          {!capturedImage ? (
            <button
              type="button"
              onClick={handleTakeSnap}
              disabled={!coords || !isWithinRadius}
              className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-4 border-white disabled:opacity-50 disabled:bg-slate-400 active:scale-95 transition-transform"
            >
              <Camera className="w-8 h-8" />
            </button>
          ) : (
            <div className="flex items-center space-x-3 w-full max-w-xs">
              <button
                type="button"
                onClick={handleRetake}
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white/90 backdrop-blur-md text-slate-700 text-xs font-semibold shadow-md flex items-center justify-center space-x-1.5 active:scale-95 transition-transform"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Ulangi Foto</span>
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !capturedFile}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-md flex items-center justify-center space-x-1.5 disabled:opacity-50 active:scale-95 transition-transform"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isSubmitting ? 'Mengirim...' : 'Kirim Presensi'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
