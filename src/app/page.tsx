"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const musicLinks = [
  {
    label: "SPOTIFY",
    href: "https://open.spotify.com/artist/3j5r1ALcWx0V89OSAsqzXP",
  },
  {
    label: "TIDAL",
    href: "https://tidal.com/artist/9342774",
  },
  {
    label: "APPLE MUSIC",
    href: "https://music.apple.com/us/artist/diggy-lessard/1322188845",
  },
];

const videoUrl = "https://www.youtube.com/embed/HJzTCr_bLmk?autoplay=1&rel=0";

export default function Home() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  useEffect(() => {
    if (!isVideoOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsVideoOpen(false);
      }
    };

    document.body.classList.add("video-open");
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("video-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVideoOpen]);

  return (
    <main className="landing-page" aria-labelledby="site-title">
      <div className="landing-content">
        <h1 id="site-title" className="site-title">
          <Image
            src="/images/DiggyLessard_Title.png"
            alt="Diggy Lessard"
            width={926}
            height={161}
            priority
            className="title-image"
          />
        </h1>
      </div>

      <section className="bottom-band" aria-label="Music, video, and booking">
        <nav className="link-row" aria-label="Music and video links">
          <button
            type="button"
            className="video-link"
            onClick={() => setIsVideoOpen(true)}
          >
            VIDEO
          </button>
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
        </nav>

        <a className="booking-email" href="mailto:booking@2birds.studio">
          booking@2birds.studio
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
              setIsVideoOpen(false);
            }
          }}
        >
          <button
            type="button"
            className="video-close"
            aria-label="Close video"
            onClick={() => setIsVideoOpen(false)}
          >
            Close
          </button>
          <div className="video-frame-wrap">
            <iframe
              className="video-frame"
              src={videoUrl}
              title="Diggy Lessard video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}
