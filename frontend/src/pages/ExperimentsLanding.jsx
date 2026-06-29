import { Link } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import { experiments } from '../experiments/registry'

function Chevron({ dataId }) {
  return (
    <svg
      data-id={dataId}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-[#C0C5D2]"
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
    <AppShell className="bg-gradient-to-b from-[#FBFCFE] to-white">
      <div
        data-id="experiments-landing"
        className="flex flex-1 flex-col gap-7 overflow-y-auto px-5 pb-10"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 47px) + 28px)' }}
      >
        {/* Brand hero */}
        <div data-id="landing-hero" className="flex items-center gap-3">
          <img
            data-id="landing-logo"
            src="/icon-192.png?v=3"
            alt="noon"
            className="h-14 w-14 rounded-[18px] shadow-[0_4px_14px_rgba(29,37,57,0.18)]"
          />
          <div data-id="landing-brand" className="flex flex-col">
            <span
              data-id="landing-wordmark"
              className="font-noontree text-[28px] font-black lowercase leading-none text-noon-dark"
            >
              noon
            </span>
            <span
              data-id="landing-eyebrow"
              className="mt-1 font-noontree text-[13px] font-medium text-noon-gray"
            >
              Experiments
            </span>
          </div>
        </div>

        {/* Heading */}
        <div data-id="landing-heading-group" className="flex flex-col gap-1">
          <h1
            data-id="landing-heading"
            className="font-noontree text-[22px] font-bold leading-tight text-[#1D2539]"
          >
            Pick an experiment
          </h1>
          <p
            data-id="landing-subtitle"
            className="font-noontree text-[14px] leading-[20px] text-[#666D85]"
          >
            Explore the prototypes and switch between views.
          </p>
        </div>

        {/* Experiment cards */}
        <div data-id="landing-cards" className="flex flex-col gap-3">
          {experiments.map((e) => (
            <Link
              key={e.id}
              to={e.path}
              data-id={`experiment-card-${e.id}`}
              className="flex items-center gap-3 rounded-2xl border border-[#EEF0F4] bg-white p-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition active:scale-[0.99] active:opacity-90"
            >
              <span
                data-id={`experiment-card-${e.id}-accent`}
                className="h-11 w-1.5 shrink-0 rounded-full"
                style={{ background: e.accent }}
              />
              <span
                data-id={`experiment-card-${e.id}-text`}
                className="flex flex-1 flex-col gap-0.5"
              >
                <span
                  data-id={`experiment-card-${e.id}-title`}
                  className="font-noontree text-[15px] font-semibold leading-tight text-[#1D2539]"
                >
                  {e.title}
                </span>
                <span
                  data-id={`experiment-card-${e.id}-description`}
                  className="font-noontree text-[13px] leading-[18px] text-[#666D85]"
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
