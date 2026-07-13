import { createSignal, onMount, onCleanup, For, Show } from "solid-js"

type Milestone = {
  slug: string
  company: string
  role: string
  location: string
  category: string
  dateStart: string
  dateEnd: string
  highlights: string[]
  links: { label: string; href: string }[]
}

type Props = {
  milestones: Milestone[]
}

const CAT = {
  education: { label: "Educación", color: "var(--gold)" },
  experience: { label: "Experiencia", color: "var(--river)" },
} as const

const monthYear = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString("es-CL", { month: "short", year: "numeric" }).replace(".", "")
}

const duration = (startIso: string, endIso: string) => {
  const start = new Date(startIso)
  const end = endIso === "Present" ? new Date() : new Date(endIso)
  const months = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.4)))
  if (months < 12) return `${months} ${months === 1 ? "mes" : "meses"}`
  const years = Math.round(months / 12)
  return `${years} ${years === 1 ? "año" : "años"}`
}

export default function CvTimeline(props: Props) {
  const [shown, setShown] = createSignal<Set<string>>(new Set())
  const [active, setActive] = createSignal<string | null>(null)
  const [progress, setProgress] = createSignal(0)
  let listRef: HTMLOListElement | undefined
  const itemRefs: Record<string, HTMLLIElement> = {}
  let revealObserver: IntersectionObserver | undefined
  let activeObserver: IntersectionObserver | undefined
  let rafId = 0

  onMount(() => {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const slug = (entry.target as HTMLElement).dataset.slug
            if (slug) setShown((prev) => new Set(prev).add(slug))
            revealObserver?.unobserve(entry.target)
          }
        })
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 }
    )
    activeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const slug = (entry.target as HTMLElement).dataset.slug
            if (slug) setActive(slug)
          }
        })
      },
      { rootMargin: "-38% 0px -52% 0px", threshold: 0 }
    )
    Object.values(itemRefs).forEach((el) => {
      revealObserver?.observe(el)
      activeObserver?.observe(el)
    })

    const onScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        if (!listRef) return
        const rect = listRef.getBoundingClientRect()
        const focal = window.innerHeight * 0.45
        const p = (focal - rect.top) / rect.height
        setProgress(Math.max(0, Math.min(1, p)))
      })
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    onCleanup(() => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(rafId)
      revealObserver?.disconnect()
      activeObserver?.disconnect()
    })
  })

  const yearOf = (iso: string) => new Date(iso).getFullYear()

  return (
    <div>
      {/* leyenda */}
      <div class="flex flex-wrap gap-3 mb-10">
        <For each={Object.values(CAT)}>
          {(c) => (
            <span class="label flex items-center gap-2 px-3 py-1.5 rounded-full border" style={{ "border-color": "var(--paper-line)", color: "var(--ink-soft)" }}>
              <span class="size-2.5 rounded-full" style={{ background: c.color }} />
              {c.label}
            </span>
          )}
        </For>
      </div>

      <ol ref={listRef} class="relative pl-10 md:pl-14">
        {/* riel + línea de progreso que se llena con el scroll */}
        <div class="absolute left-[0.4rem] md:left-[0.9rem] top-1 bottom-1 w-px" style="background: var(--paper-line);" />
        <div
          class="absolute left-[0.4rem] md:left-[0.9rem] top-1 w-px origin-top"
          style={{
            background: "linear-gradient(180deg, var(--river), var(--river-deep))",
            height: "calc(100% - 0.5rem)",
            transform: `scaleY(${progress()})`,
            transition: "transform 120ms linear",
          }}
        />

        <For each={props.milestones}>
          {(m, i) => {
            const cat = CAT[m.category as keyof typeof CAT] ?? CAT.experience
            const isShown = () => shown().has(m.slug)
            const isActive = () => active() === m.slug
            const newYear = () => i() === 0 || yearOf(props.milestones[i() - 1].dateStart) !== yearOf(m.dateStart)
            return (
              <>
                <Show when={newYear()}>
                  <div
                    class="relative mb-4 mt-10 first:mt-0 transition-all duration-700"
                    style={{ opacity: isShown() ? 1 : 0, transform: isShown() ? "none" : "translateY(16px)" }}
                  >
                    <span class="absolute -left-10 md:-left-14 top-1/2 -translate-y-1/2 flex items-center justify-center size-[1.35rem] md:size-8 rounded-full font-mono text-[0.55rem] md:text-[0.62rem] font-medium" style="background: var(--ink); color: var(--paper);">
                      {String(yearOf(m.dateStart)).slice(2)}
                    </span>
                    <span class="serif italic text-3xl md:text-4xl" style="color: color-mix(in srgb, var(--ink) 26%, transparent);">
                      {yearOf(m.dateStart)}
                    </span>
                  </div>
                </Show>

                <li
                  ref={(el) => (itemRefs[m.slug] = el)}
                  data-slug={m.slug}
                  class="relative mb-8"
                  style={{
                    opacity: isShown() ? 1 : 0,
                    transform: isShown() ? "none" : "translateY(28px)",
                    transition: `opacity 650ms ease ${(i() % 3) * 90}ms, transform 650ms cubic-bezier(0.22,1,0.36,1) ${(i() % 3) * 90}ms`,
                  }}
                >
                  {/* punto en el riel */}
                  <span
                    class="absolute -left-[2.35rem] md:-left-[3.28rem] top-6 size-3 rounded-full transition-all duration-500"
                    style={{
                      background: cat.color,
                      "box-shadow": isActive() ? `0 0 0 5px color-mix(in srgb, ${cat.color} 22%, transparent)` : "none",
                      transform: isActive() ? "scale(1.25)" : "scale(1)",
                    }}
                  />

                  <div
                    class="rounded-xl border p-5 md:p-6 transition-all duration-500"
                    style={{
                      "border-color": isActive() ? cat.color : "var(--paper-line)",
                      background: isActive() ? "color-mix(in srgb, var(--paper-raised) 75%, transparent)" : "transparent",
                      "border-left-width": "3px",
                      "border-left-color": cat.color,
                    }}
                  >
                    <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span class="label" style={{ color: cat.color }}>{cat.label}</span>
                      <span class="font-mono text-xs uppercase tracking-wide" style="color: var(--ink-faint);">
                        {monthYear(m.dateStart)} — {m.dateEnd === "Present" ? "presente" : monthYear(m.dateEnd)}
                      </span>
                      <span class="font-mono text-xs px-2 py-0.5 rounded-full" style="background: var(--paper-raised); color: var(--ink-soft);">
                        {duration(m.dateStart, m.dateEnd)}
                      </span>
                      <Show when={m.dateEnd === "Present"}>
                        <span class="font-mono text-[0.62rem] uppercase tracking-wider px-2 py-0.5 rounded-full" style="background: var(--river); color: var(--paper);">
                          actual
                        </span>
                      </Show>
                    </div>
                    <h3 class="serif italic text-2xl md:text-[1.7rem] mt-2" style="color: var(--ink);">
                      {m.role}
                    </h3>
                    <div class="text-sm mt-0.5 font-semibold" style="color: var(--ink-soft);">
                      {m.company}
                      {m.location ? <span style="color: var(--ink-faint); font-weight: 400;"> · {m.location}</span> : null}
                    </div>
                    {m.highlights.length > 0 && (
                      <ul class="mt-3 space-y-1.5 text-sm" style="color: var(--ink-soft);">
                        <For each={m.highlights}>
                          {(h) => (
                            <li class="flex gap-2">
                              <span aria-hidden="true" style={{ color: cat.color }}>—</span>
                              <span>{h}</span>
                            </li>
                          )}
                        </For>
                      </ul>
                    )}
                    {m.links.length > 0 && (
                      <div class="flex flex-wrap gap-3 mt-3">
                        <For each={m.links}>
                          {(l) => (
                            <a href={l.href} target="_blank" rel="noopener noreferrer" class="font-mono text-xs underline underline-offset-2 hover:text-river-deep transition-colors" style="color: var(--ink-faint);">
                              {l.label} &#8599;
                            </a>
                          )}
                        </For>
                      </div>
                    )}
                  </div>
                </li>
              </>
            )
          }}
        </For>
      </ol>
    </div>
  )
}
