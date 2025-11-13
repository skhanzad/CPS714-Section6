import { useEffect, useRef, useState } from "react";

// Type definitions for the Barcode Detection API
interface BarcodeDetector {
  detect(source: HTMLVideoElement): Promise<DetectedBarcode[]>;
}

interface DetectedBarcode {
  rawValue: string;
  format: string;
}

interface BarcodeDetectorConstructor {
  new (options: { formats: string[] }): BarcodeDetector;
}

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

export default function QrScanner({
  onDetect,
}: {
  onDetect: (token: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [supported, setSupported] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let stream: MediaStream | undefined;
    let detector: BarcodeDetector | undefined;
    let rafId = 0;

    (async () => {
      try {
        const isSupported = "BarcodeDetector" in window;
        setSupported(isSupported);
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        if (isSupported && window.BarcodeDetector) {
          detector = new window.BarcodeDetector({
            formats: ["qr_code"],
          });
          const tick = async () => {
            try {
              if (videoRef.current && detector) {
                const codes = await detector.detect(videoRef.current);
                if (codes && codes.length > 0) {
                  const raw = codes[0].rawValue || "";
                  if (raw) onDetect(raw);
                }
              }
            } catch {
              // Silently ignore detection errors
            }
            rafId = requestAnimationFrame(tick);
          };
          rafId = requestAnimationFrame(tick);
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Camera error";
        setError(errorMessage);
      }
    })();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [onDetect]);

  return (
    <div className="space-y-2">
      <video ref={videoRef} className="w-full rounded border border-black/10" />
      {!supported && (
        <p className="text-sm text-black/60">
          QR detection not supported; use manual entry.
        </p>
      )}
      <ManualEntry onDetect={onDetect} />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

function ManualEntry({ onDetect }: { onDetect: (token: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <div className="flex gap-2">
      <input
        className="border rounded px-3 py-2 flex-1"
        placeholder="Enter QR token"
        value={val}
        onChange={(e) => setVal(e.target.value)}
      />
      <button
        className="bg-black text-white rounded px-3 py-2"
        onClick={() => val && onDetect(val)}
      >
        Check In
      </button>
    </div>
  );
}