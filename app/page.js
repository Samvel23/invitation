"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./page.module.css";

/* ─── Countdown helper ─── */
function useCountdown(targetDate) {
  const calc = () => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function WeddingInvitation() {
  const [phase, setPhase] = useState("idle"); // idle | cracking | opening | rising | revealing | done
  const [showModal, setShowModal] = useState(false);

  /* ── music ── */
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [musicReady, setMusicReady] = useState(false);

  /* ── countdown to May 26 2026 16:00 Yerevan (UTC+4 = 12:00 UTC) ── */
  const countdown = useCountdown("2026-05-26T12:00:00Z");

  /* ── Init audio ── */
  useEffect(() => {
    const audio = new Audio("/music.mp3");
    audio.loop = true;
    audio.volume = 0.45;
    audioRef.current = audio;
    audio.addEventListener("canplaythrough", () => setMusicReady(true), {
      once: true,
    });
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  const toggleMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch(() => {});
      setPlaying(true);
    }
  }, [playing]);

  /* ── Auto-play when site reveals ── */
  useEffect(() => {
    if (phase === "done" && audioRef.current && musicReady) {
      audioRef.current
        .play()
        .then(() => setPlaying(true))
        .catch(() => {});
    }
  }, [phase, musicReady]);

  /* ── Scroll-reveal ── */
  useEffect(() => {
    if (phase !== "done") return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add(styles.visible);
        }),
      { threshold: 0.12 },
    );
    document
      .querySelectorAll(`.${styles.revealSection}`)
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [phase]);

  /* ── Parallax hero ── */
  useEffect(() => {
    if (phase !== "done") return;
    const onScroll = () => {
      const img = document.querySelector(`.${styles.heroImage}`);
      if (img) img.style.transform = `translateY(${window.scrollY * 0.25}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [phase]);

  /* ── Envelope sequence ── */
  const handleOpen = () => {
    if (phase !== "idle") return;
    setPhase("cracking");
    setTimeout(() => setPhase("opening"), 750);
    setTimeout(() => setPhase("rising"), 1600);
    setTimeout(() => setPhase("revealing"), 2900);
    setTimeout(() => setPhase("done"), 4100);
  };

  const preventSave = (e) => e.preventDefault();
  const isIntroGone = phase === "done";
  const envelopeOpen = ["opening", "rising", "revealing"].includes(phase);

  return (
    <div className={styles.mainContainer}>
      {/* ══════════════════════════
          FLOATING MUSIC BUTTON
      ══════════════════════════ */}
      {isIntroGone && (
        <button
          className={`${styles.musicBtn} ${playing ? styles.musicPlaying : ""}`}
          onClick={toggleMusic}
          aria-label={playing ? "Pause music" : "Play music"}
        >
          <span className={styles.vinyl}>
            <span className={styles.vinylGroove} />
            <span className={styles.vinylCenter} />
          </span>
          {playing ? (
            <span className={styles.iconPause}>
              <span />
              <span />
            </span>
          ) : (
            <span className={styles.iconPlay} />
          )}
        </button>
      )}

      {/* ══════════════════════════
          INTRO OVERLAY
      ══════════════════════════ */}
      {!isIntroGone && (
        <div
          className={`${styles.introOverlay} ${phase === "revealing" ? styles.curtainSplit : ""}`}
        >
          {/* curtain panels */}
          <div className={`${styles.curtainPanel} ${styles.curtainLeft}`} />
          <div className={`${styles.curtainPanel} ${styles.curtainRight}`} />

          {/* floating petals */}
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className={`${styles.petal} ${styles[`petal${n}`]}`} />
          ))}

          {/* ── envelope ── */}
          <div
            className={[
              styles.envelope,
              phase === "cracking" ? styles.sealCracking : "",
              envelopeOpen ? styles.envelopeOpen : "",
              phase === "rising" ? styles.letterRising : "",
            ].join(" ")}
            onClick={handleOpen}
          >
            <div className={styles.envBack} />
            <div className={styles.envFoldLeft} />
            <div className={styles.envFoldRight} />

            {/* flap */}
            <div className={styles.flap}>
              <div className={styles.flapShading} />
            </div>

            {/* wax seal */}
            <div
              className={`${styles.waxSeal} ${phase === "cracking" ? styles.sealBreak : ""}`}
            >
              <div className={styles.sealRing} />
              <span className={styles.sealMonogram}>A&amp;E</span>
              <div className={styles.sealCrack1} />
              <div className={styles.sealCrack2} />
              <div className={styles.sealCrack3} />
            </div>

            {/* letter */}
            <div className={styles.letterPreview}>
              <div className={styles.paperLines} />
              <div className={styles.letterInner}>
                <div className={styles.letterOrnament}>✦</div>
                <span className={styles.label}>You are invited</span>
                <div className={styles.letterRule} />
                <h2 className={styles.scriptName}>Aram &amp; Eliz</h2>
                <div className={styles.letterRule} />
                <p className={styles.dateText}>May 26 · 2026</p>
                <p className={styles.venueText}>Lazur Restaurant, Yerevan</p>
                <p className={styles.tapText}>
                  {phase === "idle" ? "✦  Tap to Open  ✦" : "Opening…"}
                </p>
                <div className={styles.letterOrnament}>✦</div>
              </div>
            </div>

            <div className={styles.pocket} />
          </div>

          {phase === "idle" && (
            <p className={styles.envHint}>tap the envelope to begin</p>
          )}
        </div>
      )}

      {/* ══════════════════════════
          MAIN CONTENT
      ══════════════════════════ */}
      <main
        className={`${styles.mainContent} ${isIntroGone ? styles.mainVisible : ""}`}
      >
        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.imageProtector} onContextMenu={preventSave}>
            <img
              src="/2.JPG"
              className={styles.heroImage}
              alt="Aram and Eliz"
              draggable="false"
            />
          </div>
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>May 26 · 2026 · Yerevan</p>
            <h1 className={styles.mainTitle}>Aram &amp; Eliz</h1>
            <div className={styles.heroDivider} />
            <p className={styles.heroDescription}>
              Join us for a day of love, laughter, and celebration
            </p>
            <div className={styles.heroScroll}>
              <span />
            </div>
          </div>
        </section>

        {/* COUNTDOWN */}
        <section
          className={`${styles.countdownSection} ${styles.revealSection}`}
        >
          <span className={styles.accentLabel}>Until the Big Day</span>
          <div className={styles.countdownGrid}>
            {[
              { v: countdown.days, l: "Days" },
              { v: countdown.hours, l: "Hours" },
              { v: countdown.minutes, l: "Minutes" },
              { v: countdown.seconds, l: "Seconds" },
            ].map(({ v, l }, i) => (
              <div
                key={l}
                className={`${styles.countdownItem} ${styles.revealSection}`}
                style={{ "--delay": `${i * 0.08}s` }}
              >
                <span className={styles.countdownNumber}>
                  {String(v).padStart(2, "0")}
                </span>
                <span className={styles.countdownSep} />
                <span className={styles.countdownLabel}>{l}</span>
              </div>
            ))}
          </div>
        </section>

        {/* GALLERYYY */}
        <section className={`${styles.section} ${styles.revealSection}`}>
          <span className={styles.accentLabel}>Our Moments</span>
          <h2 className={styles.sectionTitle}>Captured Love</h2>
          <div className={styles.gallery} onContextMenu={preventSave}>
            {["/1.JPG", "/4.JPG", "/5.JPG"].map((src, i) => (
              <div
                key={src}
                className={[
                  styles.photoWrapper,
                  i === 2 ? styles.photoLarge : "",
                  styles.revealSection,
                ].join(" ")}
                style={{ "--delay": `${i * 0.14}s` }}
              >
                <img src={src} alt={`Moment ${i + 1}`} draggable="false" />
                <div className={styles.photoSheen} />
              </div>
            ))}
          </div>
        </section>

        {/* DETAILS */}
        <section className={`${styles.detailsSection} ${styles.revealSection}`}>
          <div className={styles.detailsGrid}>
            {[
              {
                icon: "◇",
                head: "When",
                lines: ["Thursday, May 26", "16:00 Ceremony"],
              },
              {
                icon: "◇",
                head: "Where",
                lines: ["Lazur Restaurant", "Yerevan, Armenia"],
              },
              {
                icon: "◇",
                head: "Schedule",
                lines: ["16:00 — Ceremony", "17:30 — Dinner & Dance"],
              },
            ].map(({ icon, head, lines }, i) => (
              <div
                key={head}
                className={`${styles.detailCard} ${styles.revealSection}`}
                style={{ "--delay": `${i * 0.1}s` }}
              >
                <div className={styles.detailIcon}>{icon}</div>
                <h3>{head}</h3>
                {lines.map((l) => (
                  <p key={l}>{l}</p>
                ))}
              </div>
            ))}
          </div>
          <div className={styles.screenshotAction}>
            <button
              className={styles.primaryButton}
              onClick={() => setShowModal(true)}
            >
              Save the Details
            </button>
            <p className={styles.buttonHint}>
              Opens details to screenshot
            </p>
          </div>
        </section>

        {/* FOOTER */}
        <footer className={`${styles.footer} ${styles.revealSection}`}>
          <div className={styles.footerDivider} />
          <h2 className={styles.footerScript}>
            We can't wait to celebrate with you
          </h2>
          <p className={styles.footerDate}>26 · 05 · 2026</p>
        </footer>
      </main>

      {/* ══════════════════════════
          SCREENSHOT MODAL
      ══════════════════════════ */}
      {showModal && (
        <div className={styles.screenshotModal}>
          <button
            className={styles.closeModalBtn}
            onClick={() => setShowModal(false)}
          >
            ✕ Close
          </button>
          <div className={styles.screenshotCard}>
            {["tl", "tr", "bl", "br"].map((c) => (
              <div key={c} className={styles.cardCorner} data-corner={c} />
            ))}
            <h2
              className={styles.scriptName}
              style={{ fontSize: "3rem", color: "#1a1a1a" }}
            >
              Aram &amp; Eliz
            </h2>
            <div
              className={styles.divider}
              style={{ background: "#b39359", margin: "20px auto" }}
            />
            <p className={styles.modalSubtitle}>Thursday · May 26 · 2026</p>
            <div className={styles.modalDetails}>
              <h3>Location</h3>
              <p>Lazur Restaurant</p>
              <p>Yerevan, Armenia</p>
              <h3 style={{ marginTop: "28px" }}>Schedule</h3>
              <p>16:00 — Ceremony</p>
              <p>17:30 — Dinner &amp; Party</p>
            </div>
            <p className={styles.screenshotHint}>
              Take a screenshot to save
            </p>
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Great+Vibes&family=Montserrat:wght@300;400;500&display=swap");
        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }
        html {
          scroll-behavior: smooth;
        }
        body {
          margin: 0;
        }
      `}</style>
    </div>
  );
}
