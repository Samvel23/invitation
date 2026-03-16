"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./page.module.css";
import {
  BsCalendar3,
  BsGeoAlt,
  BsClock,
  BsTelephone,
  BsSuitHeart,
  BsSuitHeartFill,
} from "react-icons/bs";
import { PiDressLight, PiMusicNoteLight } from "react-icons/pi";
import { LuCalendarHeart } from "react-icons/lu";

/* ─────────────────────────────────────────
   TRANSLATIONS  (no Armenian in keys!)
───────────────────────────────────────── */
const T = {
  en: {
    eyebrow: "May 26 · 2026 · Yerevan",
    heroDesc: "Join us for a day of love, laughter, and celebration",
    countdownLabel: "Until the Big Day",
    cdUnits: ["Days", "Hours", "Minutes", "Seconds"],
    momentsLabel: "Our Moments",
    momentsTitle: "Captured Love",
    dresscodeLabel: "Dress Code",
    dresscodeText: "Formal · Elegant",
    dresscodeNote: "Black tie or formal evening attire",
    detailsLabel: "The Details",
    detailsTitle: "Everything You Need to Know",
    cards: [
      {
        head: "Date & Time",
        lines: ["Tuesday, May 26, 2026", "Ceremony begins at 16:00"],
        sub: "Save the date",
      },
      {
        head: "Venue",
        lines: ["Lazur Restaurant", "Yerevan, Armenia"],
        sub: "We can't wait to see you there",
      },
      {
        head: "Schedule",
        lines: [
          "16:00 — Ceremony",
          "17:30 — Dinner & Dance",
        ],
        sub: "An evening to remember",
      },
    ],
    saveDetails: "Save the Details",
    saveHint: "Opens details to screenshot",
    rsvpLabel: "Kindly Reply",
    rsvpTitle: "Will You Join Us?",
    rsvpDeadline: "Please respond by May 10, 2026",
    rsvpBody:
      "Your presence would mean a lot to us.\nTo confirm your attendance, please call us:",
    rsvpNote: "Please let us know the number of guests attending.",
    footerScript: "We can't wait to celebrate with you",
    langToggle: "ՀԱՅ",
  },
  hy: {
    eyebrow: "Մայիս 26 · 2026 · Երևան",
    heroDesc: "Հրավիրում ենք կիսվել մեր ուրախությամբ",
    countdownLabel: "Մինչև Մեծ Օրը",
    cdUnits: ["Օր", "Ժամ", "Րոպե", "Վայրկյան"],
    momentsLabel: "Մեր Պահերը",
    momentsTitle: "Լուսանկարներ",
    dresscodeLabel: "Հագուստի Կոդ",
    dresscodeText: "Պաշտոնական · Էլեգանտ",
    dresscodeNote: "Գիշերային պաշտոնական հագուստ",
    detailsLabel: "Մանրամասները",
    detailsTitle: "Ամեն ինչ, ինչ ձեզ հարկավոր է իմանալ",
    cards: [
      {
        head: "Ամսաթիվ և Ժամ",
        lines: [
          "Երեքշաբթի, Մայիս 26, 2026",
          "Արարողությունը սկսվում է 16:00-ին",
        ],
        sub: "Նշեք ամսաթիվը",
      },
      {
        head: "Վայրը",
        lines: ["Լազուր Ռեստորան", "Երևան, Հայաստան"],
        sub: "Անհամբեր սպասում ենք ձեզ",
      },
      {
        head: "Ժամանակացույց",
        lines: [
          "16:00 — Արարողություն",
          "17:30 — Ընթրիք & Պար",
        ],
        sub: "Անմոռանալի երեկո",
      },
    ],
    saveDetails: "Պահպանել Մանրամասները",
    saveHint: "Բացում է էկրանի նկարի համար",
    rsvpLabel: "Հաստատեք Ներկայությունը",
    rsvpTitle: "Կգա՞ք Մեզ Հետ կիսելու այս պահը",
    rsvpDeadline: "Խնդրում ենք պատասխանել մինչև Մայիս 10, 2026",
    rsvpBody:
      "Ձեր ներկայությունը մեզ համար անգնահատելի կլինի։\nՄասնակցությունը հաստատելու համար զանգահարեք մեզ.",
    rsvpNote: "Խնդրում ենք նշել հյուրերի քանակը։",
    footerScript: "Անհամբեր սպասում ենք ձեզ",
    langToggle: "ENG",
  },
};

/* ─────────────────────────────────────────
   COUNTDOWN
───────────────────────────────────────── */
function useCountdown(targetDate) {
  const calc = useCallback(() => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return [0, 0, 0, 0];
    return [
      Math.floor(diff / 86400000),
      Math.floor((diff % 86400000) / 3600000),
      Math.floor((diff % 3600000) / 60000),
      Math.floor((diff % 60000) / 1000),
    ];
  }, [targetDate]);

  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);
  return time; // array [days, hours, minutes, seconds]
}

/* card icons — stable, not translated */
const CARD_ICONS = [BsCalendar3, BsGeoAlt, BsClock];

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */
export default function WeddingInvitation() {
  const [phase, setPhase] = useState("idle");
  const [showModal, setShowModal] = useState(false);
  const [lang, setLang] = useState("en");

  const t = T[lang];

  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [musicReady, setMusicReady] = useState(false);

  // countdown returns a stable array — keys never change
  const cdValues = useCountdown("2026-05-26T12:00:00Z");

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
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().catch(() => {});
      setPlaying(true);
    }
  }, [playing]);

  useEffect(() => {
    if (phase === "done" && audioRef.current && musicReady)
      audioRef.current
        .play()
        .then(() => setPlaying(true))
        .catch(() => {});
  }, [phase, musicReady]);

  /* scroll reveal — re-run when lang changes so newly visible text gets observed */
  useEffect(() => {
    if (phase !== "done") return;
    // small delay so React finishes re-rendering translated text first
    const t = setTimeout(() => {
      const obs = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) e.target.classList.add(styles.visible);
          }),
        { threshold: 0.08 },
      );
      document
        .querySelectorAll(`.${styles.revealSection}`)
        .forEach((el) => obs.observe(el));
      return () => obs.disconnect();
    }, 50);
    return () => clearTimeout(t);
  }, [phase, lang]);

  /* parallax */
  useEffect(() => {
    if (phase !== "done") return;
    const onScroll = () => {
      const img = document.querySelector(`.${styles.heroImage}`);
      if (img) img.style.transform = `translateY(${window.scrollY * 0.25}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [phase]);

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
      {/* MUSIC BTN */}
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

      {/* LANGUAGE TOGGLE */}
      {isIntroGone && (
        <button
          className={styles.langBtn}
          onClick={() => setLang((l) => (l === "en" ? "hy" : "en"))}
        >
          {t.langToggle}
        </button>
      )}

      {/* ══════════ INTRO OVERLAY ══════════ */}
      {!isIntroGone && (
        <div
          className={`${styles.introOverlay} ${phase === "revealing" ? styles.curtainSplit : ""}`}
        >
          <div className={`${styles.curtainPanel} ${styles.curtainLeft}`} />
          <div className={`${styles.curtainPanel} ${styles.curtainRight}`} />

          {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
            <div
              key={n}
              className={`${styles.petal} ${styles[`petal${n + 1}`]}`}
            />
          ))}

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
            <div className={styles.flap}>
              <div className={styles.flapShading} />
            </div>
            <div
              className={`${styles.waxSeal} ${phase === "cracking" ? styles.sealBreak : ""}`}
            >
              <div className={styles.sealRing} />
              <span className={styles.sealMonogram}>A&amp;E</span>
              <div className={styles.sealCrack1} />
              <div className={styles.sealCrack2} />
              <div className={styles.sealCrack3} />
            </div>
            <div className={styles.letterPreview}>
              <div className={styles.paperLines} />
              <div className={styles.letterInner}>
                <div className={styles.letterOrnament}>✦</div>
                <span className={styles.label}>You are cordially invited</span>
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

      {/* ══════════ MAIN CONTENT ══════════ */}
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
            <p className={styles.eyebrow}>{t.eyebrow}</p>
            <h1 className={styles.mainTitle}>Aram &amp; Eliz</h1>
            <div className={styles.heroDivider} />
            <p className={styles.heroDescription}>{t.heroDesc}</p>
            <div className={styles.heroScroll}>
              <span />
            </div>
          </div>
        </section>

        {/* COUNTDOWN — stable index keys, never remounted */}
        <section
          className={`${styles.countdownSection} ${styles.revealSection}`}
        >
          <span className={`${styles.accentLabel} ${styles.accentLabelLight}`}>
            {t.countdownLabel}
          </span>
          <div className={styles.countdownGrid}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i} /* ← stable numeric key */
                className={styles.countdownItem}
                style={{ "--delay": `${i * 0.08}s` }}
              >
                <span className={styles.countdownNumber}>
                  {String(cdValues[i]).padStart(2, "0")}
                </span>
                <span className={styles.countdownSep} />
                <span className={styles.countdownLabel}>{t.cdUnits[i]}</span>
              </div>
            ))}
          </div>
        </section>

        {/* DRESS CODE STRIP */}
        

        {/* GALLERY */}
        <section className={`${styles.section} ${styles.revealSection}`}>
          <span className={styles.accentLabel}>{t.momentsLabel}</span>
          <h2 className={styles.sectionTitle}>{t.momentsTitle}</h2>
          <div className={styles.gallery} onContextMenu={preventSave}>
            {["/3.JPG", "/4.jpg", "/5.JPG"].map((src, i) => (
              <div
                key={i} /* ← stable numeric key */
                className={[
                  styles.photoWrapper,
                  i === 2 ? styles.photoLarge : "",
                ].join(" ")}
                style={{ "--delay": `${i * 0.14}s` }}
              >
                <img src={src} alt={`Moment ${i + 1}`} draggable="false" />
                <div className={styles.photoSheen} />
              </div>
            ))}
          </div>
        </section>

        {/* DETAILS — stable index keys */}
        <section className={`${styles.detailsSection} ${styles.revealSection}`}>
          <span className={styles.accentLabel}>{t.detailsLabel}</span>
          <h2 className={styles.sectionTitleDark}>{t.detailsTitle}</h2>
          <div className={styles.detailsGrid}>
            {t.cards.map((card, i) => {
              const Icon = CARD_ICONS[i];
              return (
                <div
                  key={i} /* ← stable numeric key */
                  className={styles.detailCard}
                >
                  <div className={styles.detailCardTop}>
                    <div className={styles.detailIconCircle}>
                      <Icon size={22} />
                    </div>
                    <h3 className={styles.detailHead}>{card.head}</h3>
                  </div>
                  <div className={styles.detailCardBody}>
                    {card.lines.map((line, j) => (
                      <p
                        key={j}
                        className={
                          j === 0 ? styles.detailLine1 : styles.detailLine
                        }
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                  <p className={styles.detailSub}>
                    <BsSuitHeart
                      size={10}
                      style={{ marginRight: 6, opacity: 0.5 }}
                    />
                    {card.sub}
                  </p>
                </div>
              );
            })}
          </div>

          <div className={styles.screenshotAction}>
            <button
              className={styles.primaryButton}
              onClick={() => setShowModal(true)}
            >
              {t.saveDetails}
            </button>
          </div>
        </section>

        {/* RSVP — no nested revealSection children */}
        <section className={`${styles.rsvpSection} ${styles.revealSection}`}>
          <div className={styles.rsvpTopRule}>
            <span />
            <span className={styles.rsvpRuleDiamond}>◆</span>
            <span />
          </div>

          <LuCalendarHeart size={38} className={styles.rsvpBigIcon} />
          <span className={styles.accentLabel}>{t.rsvpLabel}</span>
          <h2 className={styles.sectionTitle}>{t.rsvpTitle}</h2>

          <div className={styles.rsvpDeadlineBadge}>
            <BsCalendar3 size={13} />
            <span>{t.rsvpDeadline}</span>
          </div>

          <p className={styles.rsvpBody}>
            {t.rsvpBody.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                {i === 0 && <br />}
              </span>
            ))}
          </p>

          <a href="tel:+37410052026" className={styles.rsvpPhoneLink}>
            <BsTelephone size={18} />
            <span>+374 10 052 026</span>
          </a>


          <div className={styles.rsvpTopRule} style={{ marginTop: "3.5rem" }}>
            <span />
            <span className={styles.rsvpRuleDiamond}>◆</span>
            <span />
          </div>
        </section>

        {/* FOOTER */}
        <footer className={`${styles.footer} ${styles.revealSection}`}>
          <div className={styles.footerDivider} />
          <BsSuitHeartFill size={14} className={styles.footerHeart} />
          <h2 className={styles.footerScript}>{t.footerScript}</h2>
          <p className={styles.footerDate}>26 · 05 · 2026</p>
          <p className={styles.footerNames}>Aram &amp; Eliz</p>
        </footer>
      </main>

      {/* SCREENSHOT MODAL */}
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
            <p className={styles.modalSubtitle}>Tuesday · May 26 · 2026</p>
            <div className={styles.modalDetails}>
              <h3>Location</h3>
              <p>Lazur Restaurant</p>
              <p>Yerevan, Armenia</p>
              <h3 style={{ marginTop: "24px" }}>Schedule</h3>
              <p>16:00 — Ceremony</p>
              <p>17:30 — Dinner &amp; Party</p>
              <h3 style={{ marginTop: "24px" }}>RSVP by</h3>
              <p>May 10, 2026</p>
            </div>
            <p className={styles.screenshotHint}>
              Take a screenshot
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
