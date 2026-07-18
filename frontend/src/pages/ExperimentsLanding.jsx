import { Link } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import { experiments } from '../experiments/registry'

/* Filled 20px icons for the experiment card badges, keyed by registry `icon`. */
const ICONS = {
  sparkle: (
    <path d="M10 1.8c.4 4.1 2 5.7 6.2 6.2-4.2.4-5.8 2-6.2 6.2-.4-4.2-2-5.8-6.2-6.2 4.2-.5 5.8-2.1 6.2-6.2zm5.4 9.4c.2 2.1 1 2.9 3 3.1-2 .2-2.8 1-3 3-.2-2-1-2.8-3-3 2-.2 2.8-1 3-3.1z" />
  ),
  grid: (
    <path d="M3 4.8A1.8 1.8 0 014.8 3h2.9a1.8 1.8 0 011.8 1.8v2.9a1.8 1.8 0 01-1.8 1.8H4.8A1.8 1.8 0 013 7.7V4.8zm7.5 0a1.8 1.8 0 011.8-1.8h2.9A1.8 1.8 0 0117 4.8v2.9a1.8 1.8 0 01-1.8 1.8h-2.9a1.8 1.8 0 01-1.8-1.8V4.8zM3 12.3a1.8 1.8 0 011.8-1.8h2.9a1.8 1.8 0 011.8 1.8v2.9A1.8 1.8 0 017.7 17H4.8A1.8 1.8 0 013 15.2v-2.9zm7.5 0a1.8 1.8 0 011.8-1.8h2.9a1.8 1.8 0 011.8 1.8v2.9a1.8 1.8 0 01-1.8 1.8h-2.9a1.8 1.8 0 01-1.8-1.8v-2.9z" />
  ),
  pin: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 1.7a6.3 6.3 0 016.3 6.3c0 2.5-1.5 4.9-3 6.7a22 22 0 01-2.8 2.8l-.5.4-.5-.4a22 22 0 01-2.8-2.8c-1.5-1.8-3-4.2-3-6.7A6.3 6.3 0 0110 1.7zM10 5.6a2.4 2.4 0 100 4.8 2.4 2.4 0 000-4.8z"
    />
  ),
  chart: (
    <path d="M3.6 11.2a.9.9 0 01.9.9v4.3a.9.9 0 01-1.8 0v-4.3a.9.9 0 01.9-.9zm4.3-3.4a.9.9 0 01.9.9v7.7a.9.9 0 01-1.8 0V8.7a.9.9 0 01.9-.9zm4.2 2.5a.9.9 0 01.9.9v5.2a.9.9 0 01-1.8 0v-5.2a.9.9 0 01.9-.9zm4.3-7.3a.9.9 0 01.9.9v12.5a.9.9 0 01-1.8 0V3.9a.9.9 0 01.9-.9z" />
  ),
  search: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.75 2.5a6.25 6.25 0 104.02 11.04l3.34 3.35a.9.9 0 001.28-1.27l-3.35-3.35A6.25 6.25 0 008.75 2.5zM4.3 8.75a4.45 4.45 0 118.9 0 4.45 4.45 0 01-8.9 0z"
    />
  ),
}

function IconBadge({ experiment }) {
  return (
    <span
      data-id={`experiment-card-${experiment.id}-badge`}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
      style={{ background: experiment.iconBg }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        aria-hidden="true"
        style={{ fill: experiment.iconColor }}
      >
        {ICONS[experiment.icon]}
      </svg>
    </span>
  )
}

function Chevron({ dataId }) {
  return (
    <svg
      data-id={dataId}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-[#B4BAC8]"
    >
      <path
        d="M7.5 5L12.5 10L7.5 15"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * ExperimentsLanding — the first screen. Pick an experiment to open it.
 */
export default function ExperimentsLanding() {
  return (
    <AppShell className="!bg-[#F6F7FA]">
      <div
        data-id="experiments-landing"
        className="flex flex-1 flex-col overflow-y-auto px-4 pb-10 font-questrial"
        style={{ paddingTop: 'calc(var(--sat, 0px) + 28px)' }}
      >
        {/* Brand hero */}
        <div data-id="landing-hero" className="flex items-center gap-3 px-1">
          <img
            data-id="landing-logo"
            src="/icon-192.png?v=3"
            alt="noon"
            className="h-12 w-12 rounded-2xl shadow-[0_4px_14px_rgba(29,37,57,0.16)]"
          />
          <div data-id="landing-brand" className="flex flex-col">
            <span
              data-id="landing-wordmark"
              className="text-[24px] lowercase leading-none text-[#1D2539]"
            >
              noon
            </span>
            <span
              data-id="landing-eyebrow"
              className="mt-1 text-[13px] tracking-wide text-[#8A90A3]"
            >
              Experiments
            </span>
          </div>
        </div>

        {/* Heading */}
        <div data-id="landing-heading-group" className="mt-8 flex flex-col gap-1.5 px-1">
          <h1
            data-id="landing-heading"
            className="text-[26px] leading-tight text-[#1D2539]"
          >
            Pick an experiment
          </h1>
          <p
            data-id="landing-subtitle"
            className="text-[15px] leading-[21px] text-[#8A90A3]"
          >
            Explore the prototypes and switch between views.
          </p>
        </div>

        {/* Experiment cards */}
        <div data-id="landing-cards" className="mt-6 flex flex-col gap-3.5">
          {experiments.map((e) => (
            <Link
              key={e.id}
              to={e.path}
              data-id={`experiment-card-${e.id}`}
              className="flex items-center gap-4 rounded-2xl border border-[#EEF0F4] bg-white px-4 py-4 shadow-[0_1px_3px_rgba(16,24,40,0.05)] transition active:scale-[0.98] active:opacity-90"
            >
              <IconBadge experiment={e} />
              <span
                data-id={`experiment-card-${e.id}-text`}
                className="flex flex-1 flex-col gap-1"
              >
                <span
                  data-id={`experiment-card-${e.id}-title`}
                  className="text-[17px] leading-tight text-[#1D2539]"
                >
                  {e.title}
                </span>
                <span
                  data-id={`experiment-card-${e.id}-description`}
                  className="text-[13px] leading-[18px] text-[#8A90A3]"
                >
                  {e.description}
                </span>
              </span>
              <Chevron dataId={`experiment-card-${e.id}-chevron`} />
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
