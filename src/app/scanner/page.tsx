"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";

interface AnalysisResult {
  item_name: string;
  category: string;
  color: string;
  brand: string | null;
  material: string;
  season: string;
  occasion: string;
  description: string;
  styling_tips: string;
  raw_response?: string;
}

type CameraFacing = "user" | "environment";

export default function ScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<CameraFacing>("environment");

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(
    async (facing: CameraFacing = facingMode) => {
      try {
        setError(null);
        // Stop any existing stream first
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
        setCapturedImage(null);
        setAnalysis(null);
      } catch (err) {
        console.error("Camera access error:", err);
        setError(
          "Could not access camera. Please allow camera permissions and try again."
        );
      }
    },
    [facingMode]
  );

  const flipCamera = useCallback(() => {
    const newFacing = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newFacing);
    if (cameraActive) {
      startCamera(newFacing);
    }
  }, [facingMode, cameraActive, startCamera]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(dataUrl);
    stopCamera();
  }, [stopCamera]);

  const analyzeImage = useCallback(async () => {
    if (!capturedImage) return;

    setAnalyzing(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: capturedImage }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Analysis failed");
        return;
      }

      setAnalysis(data.analysis);
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Failed to analyze image. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  }, [capturedImage]);

  const reset = useCallback(() => {
    setCapturedImage(null);
    setAnalysis(null);
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 backdrop-blur-sm bg-white/5">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Back
        </Link>
        <h1 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Wardrobe Scanner
        </h1>
        <div className="w-16" />
      </header>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Camera / Captured Image View */}
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-black/50 border border-white/10">
          {cameraActive && !capturedImage && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Camera overlay corners */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-purple-400 rounded-tl-lg" />
                <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-purple-400 rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-purple-400 rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-purple-400 rounded-br-lg" />
              </div>
            </>
          )}

          {capturedImage && (
            <img
              src={capturedImage}
              alt="Captured clothing"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {!cameraActive && !capturedImage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-50"
              >
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
              <p className="text-sm">Tap the button below to start scanning</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {!cameraActive && !capturedImage && (
            <button
              onClick={() => startCamera()}
              className="flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 font-semibold shadow-lg transition-all hover:bg-purple-500 active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
              Start Camera
            </button>
          )}

          {cameraActive && !capturedImage && (
            <>
              <button
                onClick={flipCamera}
                className="rounded-full bg-white/10 p-3 backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95"
                title="Flip camera"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 16h5v5" />
                </svg>
              </button>

              <button
                onClick={capturePhoto}
                className="rounded-full bg-white p-1 shadow-lg shadow-purple-500/30 transition-all hover:scale-105 active:scale-95"
                title="Capture photo"
              >
                <div className="w-16 h-16 rounded-full bg-white border-4 border-purple-500" />
              </button>

              <button
                onClick={stopCamera}
                className="rounded-full bg-white/10 p-3 backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95"
                title="Stop camera"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="m15 9-6 6" />
                  <path d="m9 9 6 6" />
                </svg>
              </button>
            </>
          )}

          {capturedImage && !analyzing && (
            <>
              <button
                onClick={reset}
                className="flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 font-semibold backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95"
              >
                Retake
              </button>
              <button
                onClick={analyzeImage}
                className="flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 font-semibold shadow-lg transition-all hover:bg-purple-500 active:scale-95"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a10 10 0 1 0 10 10" />
                  <path d="M12 12l8-8" />
                  <path d="M22 2l-4 4" />
                </svg>
                Analyze with AI
              </button>
            </>
          )}
        </div>

        {/* Loading */}
        {analyzing && (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-300 text-sm">
              Analyzing your clothing item...
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Analysis Results */}
        {analysis && !analysis.raw_response && (
          <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-xl font-bold">{analysis.item_name}</h2>
              <p className="text-sm text-gray-400 mt-1">
                {analysis.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-px bg-white/5">
              <InfoCell label="Category" value={analysis.category} />
              <InfoCell label="Color" value={analysis.color} />
              <InfoCell label="Material" value={analysis.material} />
              <InfoCell label="Season" value={analysis.season} />
              <InfoCell label="Occasion" value={analysis.occasion} />
              <InfoCell label="Brand" value={analysis.brand || "Unknown"} />
            </div>

            {analysis.styling_tips && (
              <div className="p-4 border-t border-white/10">
                <h3 className="text-sm font-semibold text-purple-400 mb-2">
                  Styling Tips
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {analysis.styling_tips}
                </p>
              </div>
            )}

            <div className="p-4 border-t border-white/10">
              <button
                onClick={reset}
                className="w-full rounded-xl bg-purple-600 py-3 font-semibold transition-all hover:bg-purple-500 active:scale-[0.98]"
              >
                Scan Another Item
              </button>
            </div>
          </div>
        )}

        {/* Raw response fallback */}
        {analysis?.raw_response && (
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <h3 className="text-sm font-semibold text-purple-400 mb-2">
              AI Response
            </h3>
            <p className="text-sm text-gray-300 whitespace-pre-wrap">
              {analysis.raw_response}
            </p>
            <button
              onClick={reset}
              className="mt-4 w-full rounded-xl bg-purple-600 py-3 font-semibold transition-all hover:bg-purple-500 active:scale-[0.98]"
            >
              Scan Another Item
            </button>
          </div>
        )}
      </div>

      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />
    </main>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-white/5">
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium mt-0.5 capitalize">{value}</p>
    </div>
  );
}
