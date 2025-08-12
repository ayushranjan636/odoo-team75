"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { mockTierChips, mockMicroBenefits } from "@/lib/mock-data"
import { showComingSoonToast } from "@/components/ui/coming-soon-toast"
import { VolumeX, Volume2, Pause, Play } from "lucide-react"
import { SchedulerModal } from "@/components/scheduler-modal"

export function HeroVideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.muted = isMuted
      if (isPlaying) {
        video.play().catch((e) => console.error("Video autoplay failed:", e))
      } else {
        video.pause()
      }
    }
  }, [isMuted, isPlaying])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleMuteUnmute = () => {
    setIsMuted(!isMuted)
  }

  const handleTierClick = (tier: string) => {
    showComingSoonToast()
    console.log(`Tier selected: ${tier}`)
  }

  return (
    <section className="relative w-full h-[600px] md:h-[700px] lg:h-[800px] overflow-hidden bg-primary">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        playsInline
        muted={isMuted}
        poster="/placeholder.svg?height=800&width=1920"
      >
        <source
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3773486-hd_1920_1080_30fps-9Kz5FonWdUdrUnzkwYBlxvzZpKQoCH.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>

      {/* Dark-to-transparent gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/25 to-transparent" />

      {/* Video Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={handleMuteUnmute}
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={handlePlayPause}
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
      </div>

      {/* Content in safe area */}
      <div className="absolute inset-0 flex items-center px-4 md:px-6 lg:px-8">
        <div className="max-w-[720px] mx-auto md:mx-0 text-center md:text-left space-y-6 animate-fade-in text-amber-500">
          <h1 className="text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tighter shadow-2xl font-sans font-black text-white">
            RENTKARO
          </h1>
          <p className="text-lg md:text-xl leading-relaxed font-extrabold shadow-2xl rounded-none border-black text-amber-400">
            Endless options, one rent. Upgrade anytime, pause anytime.
          </p>

          {/* Tier Chips */}
          

          {/* Price Pill + CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-4">
            <div className="bg-secondary text-secondary-foreground px-6 py-3 rounded-full font-semibold text-lg shadow-md">
              Starting from ₹2,699/mo
            </div>
            <Link href="/browse" prefetch={false}>
              {/* Added missing link content */}
              
            </Link>
            <Button
              variant="ghost"
              className="border border-white text-white hover:bg-white hover:text-primary px-8 py-6 text-lg font-semibold rounded-lg transition-colors duration-200 bg-transparent"
              onClick={() => setIsSchedulerOpen(true)}
            >
              Schedule a Free Consultation
            </Button>
          </div>

          {/* Micro-benefits */}
          <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-white/80 pt-4">
            {mockMicroBenefits.map((benefit, index) => (
              <span key={index} className="whitespace-nowrap">
                {benefit}
              </span>
            ))}
          </div>
        </div>
      </div>
      <SchedulerModal isOpen={isSchedulerOpen} onClose={() => setIsSchedulerOpen(false)} />
    </section>
  )
}
