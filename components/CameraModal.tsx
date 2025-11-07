
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface CameraModalProps {
  onCapture: (imageDataUrl: string) => void;
  onClose: () => void;
  purpose: 'LOCK' | 'PROOF';
}

const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
);


export const CameraModal: React.FC<CameraModalProps> = ({ onCapture, onClose, purpose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access the camera. Please check permissions and try again.");
    }
  }, []);
  
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);
  
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startCamera]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageDataUrl);
        stopCamera();
      }
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const purposeText = purpose === 'LOCK'
    ? 'Take a clear picture of a 3-digit lock. This is your reward.'
    : 'Take a picture providing proof you completed your goal.';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-4">
        <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            <div className="relative aspect-video">
                {error && <div className="absolute inset-0 flex items-center justify-center bg-red-900 text-white p-4">{error}</div>}
                <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${capturedImage ? 'hidden' : 'block'}`}></video>
                {capturedImage && <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />}
                <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
             <div className="p-4 bg-gray-900 text-center">
                <p className="text-gray-300 mb-4">{capturedImage ? "Happy with this picture?" : purposeText}</p>
                <div className="flex justify-center space-x-4">
                    {!capturedImage ? (
                        <button onClick={handleCapture} className="p-4 bg-indigo-600 rounded-full text-white hover:bg-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500">
                            <CameraIcon />
                        </button>
                    ) : (
                        <>
                            <button onClick={handleRetake} className="px-6 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition-colors">Retake</button>
                            <button onClick={handleConfirm} className="px-6 py-2 bg-green-600 rounded-md text-white hover:bg-green-500 transition-colors">Confirm</button>
                        </>
                    )}
                </div>
            </div>
        </div>
         <button onClick={onClose} className="absolute top-4 right-4 text-white text-2xl font-bold">&times;</button>
    </div>
  );
};
