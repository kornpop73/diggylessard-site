"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const musicLinks = [
  {
    label: "APPLE MUSIC",
    href: "https://music.apple.com/us/artist/diggy-lessard/1322188845",
  },
  {
    label: "SPOTIFY",
    href: "https://open.spotify.com/artist/3j5r1ALcWx0V89OSAsqzXP",
  },
  {
    label: "INSTAGRAM",
    href: "https://www.instagram.com/diggylessard/",
  },
];

export default function Home() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const stopVideo = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  }, []);

  const closeVideo = useCallback(() => {
    stopVideo();
    setIsVideoOpen(false);

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined);
    }
  }, [stopVideo]);

  const openVideo = () => {
    setIsVideoOpen(true);

    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => undefined);
    }
  };

  useEffect(() => {
    if (!isVideoOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeVideo();
      }
    };

    document.body.classList.add("video-open");
    window.addEventListener("keydown", handleKeyDown);
    videoRef.current?.play().catch(() => undefined);

    return () => {
      stopVideo();
      document.body.classList.remove("video-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeVideo, isVideoOpen, stopVideo]);

  return (
    <main className="landing-page" aria-labelledby="site-title">
      <div className="landing-content">
        <h1 id="site-title" className="site-title">
          <Image
            src="/images/Title_Cropped.png"
            alt="Diggy Lessard"
            width={1490}
            height={270}
            priority
            className="title-image"
          />
        </h1>

        <Image
          src="/images/DiggyFrontal.png"
          alt=""
          width={1120}
          height={1093}
          priority
          className="portrait-image"
        />
      </div>

      <section className="bottom-band" aria-label="Music, video, and booking">
        <nav className="link-row" aria-label="Music and video links">
          {musicLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
            </a>
          ))}
          <button
            type="button"
            className="video-link"
            onClick={openVideo}
          >
            VIDEO
          </button>
        </nav>

        <a className="booking-email" href="mailto:silvir@2birds.studio">
          silvir@2birds.studio
        </a>
      </section>

      {isVideoOpen ? (
        <div
          className="video-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Diggy Lessard video"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeVideo();
            }
          }}
        >
          <button
            type="button"
            className="video-close"
            aria-label="Close video"
            onClick={closeVideo}
          />
          <div className="video-player-wrap">
            <video
              ref={videoRef}
              className="video-player"
              src="/videos/ShowYourTeethVideo.mp4"
              controls
              autoPlay
              playsInline
              onEnded={closeVideo}
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}
