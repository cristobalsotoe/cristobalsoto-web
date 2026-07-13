import defaultTheme from "tailwindcss/defaultTheme"

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        "paper-raised": "var(--paper-raised)",
        "paper-line": "var(--paper-line)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        "ink-faint": "var(--ink-faint)",
        river: "var(--river)",
        "river-deep": "var(--river-deep)",
        clay: "var(--clay)",
        gold: "var(--gold)",
        mist: "var(--mist)",
      },
      fontFamily: {
        "sans": ["Work Sans", ...defaultTheme.fontFamily.sans],
        "serif": ["Instrument Serif", "Georgia", "serif"],
        "mono": ["Plex Mono", ...defaultTheme.fontFamily.mono],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "full",
            "--tw-prose-body": "var(--ink-soft)",
            "--tw-prose-headings": "var(--ink)",
            "--tw-prose-links": "var(--river-deep)",
            "--tw-prose-bold": "var(--ink)",
            "--tw-prose-quotes": "var(--ink-soft)",
            "--tw-prose-hr": "var(--paper-line)",
            "--tw-prose-bullets": "var(--ink-faint)",
            "--tw-prose-counters": "var(--ink-faint)",
            "--tw-prose-code": "var(--ink)",
            "--tw-prose-invert-body": "var(--ink-soft)",
            "--tw-prose-invert-headings": "var(--ink)",
            "--tw-prose-invert-links": "var(--river-deep)",
            "--tw-prose-invert-bold": "var(--ink)",
            "--tw-prose-invert-hr": "var(--paper-line)",
            "--tw-prose-invert-bullets": "var(--ink-faint)",
            "--tw-prose-invert-counters": "var(--ink-faint)",
            "--tw-prose-invert-code": "var(--ink)",
            h2: { fontFamily: "Instrument Serif, Georgia, serif", fontStyle: "italic", fontWeight: "400" },
            h3: { fontFamily: "Plex Mono, monospace", fontStyle: "normal", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.85em" },
          },
        },
      },
      rotate: {
        "45": "45deg",
        "135": "135deg",
        "225": "225deg",
        "315": "315deg",
      },
      animation: {
        twinkle: "twinkle 2s ease-in-out forwards",
        meteor: "meteor 3s ease-in-out forwards",
      },
      keyframes: {
        twinkle: {
          "0%": { 
            opacity: 0, 
            transform: "rotate(0deg)" 
          },
          "50%": { 
            opacity: 1,
            transform: "rotate(180deg)" 
          },
          "100%": { 
            opacity: 0, 
            transform: "rotate(360deg)" 
          },
        },
        meteor: {
          "0%": { 
            opacity: 0, 
            transform: "translateY(200%)" 
          },
          "50%": { 
            opacity: 1  
          },
          "100%": { 
            opacity: 0, 
            transform: "translateY(0)" 
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}
