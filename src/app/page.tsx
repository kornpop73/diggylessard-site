import Image from "next/image";

const links = [
  {
    label: "SPOTIFY",
    href: "https://open.spotify.com/artist/3j5r1ALcWx0V89OSAsqzXP",
  },
  { label: "TIDAL" },
  { label: "APPLE" },
  {
    label: "YOUTUBE",
    href: "https://www.youtube.com/@diggylessard",
  },
  { label: "SOUNDCLOUD" },
  {
    label: "INSTAGRAM",
    href: "https://www.instagram.com/diggylessard/",
  },
];

export default function Home() {
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

        <nav className="link-row" aria-label="Music and social links">
          {links.map((link) =>
            link.href ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ) : (
              <span key={link.label} className="unavailable">
                {link.label}
              </span>
            ),
          )}
        </nav>

        <a className="booking-email" href="mailto:booking@2birds.studio">
          booking@2birds.studio
        </a>
      </div>
    </main>
  );
}
