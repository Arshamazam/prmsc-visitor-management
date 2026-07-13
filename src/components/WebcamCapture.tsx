"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

type WebcamCaptureProps = {
  onCapture: (base64: string, mimeType: string) => void
  onClear: () => void
  captured: boolean
  onStreamingChange?: (streaming: boolean) => void
}

export function WebcamCapture({
  onCapture,
  onClear,
  captured,
  onStreamingChange,
}: WebcamCaptureProps) {
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }

  useEffect(() => {
    return () => {
      stopStream()
    }
  }, [])

  // The <video> element only mounts once `streaming` is true, so the stream
  // must be attached here (after the DOM commit) rather than right after
  // getUserMedia() resolves — videoRef.current is still null at that point.
  useEffect(() => {
    if (streaming && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
    onStreamingChange?.(streaming)
  }, [streaming, onStreamingChange])

  const handleOpenCamera = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      })
      streamRef.current = stream
      setStreaming(true)
    } catch {
      setError("Camera access denied. Please use file upload instead.")
    }
  }

  const handleCapture = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = 640
    canvas.height = 480
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.drawImage(video, 0, 0, 640, 480)
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85)
    const base64 = dataUrl.replace(/^data:image\/jpeg;base64,/, "")

    setPreviewUrl(dataUrl)
    onCapture(base64, "image/jpeg")

    stopStream()
    setStreaming(false)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      const match = dataUrl.match(/^data:(.+);base64,(.*)$/)
      if (!match) return
      const mimeType = match[1]
      const base64 = match[2]
      setPreviewUrl(dataUrl)
      onCapture(base64, mimeType)
    }
    reader.readAsDataURL(file)
  }

  const handleRetake = () => {
    setPreviewUrl(null)
    setStreaming(false)
    onClear()
  }

  return (
    <div className="space-y-3">
      {captured && previewUrl ? (
        <div className="space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Captured visitor photo"
            className="w-full max-w-xs rounded-md"
          />
          <Button type="button" variant="outline" onClick={handleRetake}>
            Retake Photo
          </Button>
        </div>
      ) : streaming ? (
        <div className="space-y-2">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full max-w-xs rounded-md"
          />
          <Button type="button" onClick={handleCapture}>
            Capture Photo
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Button type="button" onClick={handleOpenCamera}>
            Open Camera
          </Button>
          <div>
            <input type="file" accept="image/*" onChange={handleFileUpload} />
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" width={640} height={480} />

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
