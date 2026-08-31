// Small inline icon set shared by the auth + shop pages so we don't pull in
// an icon library for a handful of glyphs.

export function EyeIcon({ off = false, className = 'h-5 w-5' }) {
  if (off) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path
          d="M10.58 10.58a2 2 0 002.83 2.83M9.36 5.6A9.77 9.77 0 0112 5.25c5 0 9 4.28 9 6.75-.6 1.14-1.55 2.4-2.78 3.47M6.6 6.6C4.4 8 3 10.2 3 12c0 2.47 4 6.75 9 6.75 1.06 0 2.07-.19 3-.53"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3 12c0-2.47 4-6.75 9-6.75S21 9.53 21 12s-4 6.75-9 6.75S3 14.47 3 12z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function CheckIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" fill="#22C55E" />
      <path d="M7.5 12.5l3 3 6-6.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CalendarIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronDownIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronLeftIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronRightIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CartIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3 4h2l1.6 10.2A2 2 0 008.57 16h8.86a2 2 0 001.97-1.66L21 8H6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="20" r="1.4" fill="currentColor" />
      <circle cx="17.5" cy="20" r="1.4" fill="currentColor" />
    </svg>
  );
}

export function SearchIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function TrashIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 7h16M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m-8 0l1 13a2 2 0 002 2h4a2 2 0 002-2l1-13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlusIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function MinusIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function MenuIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function ChatBubbleIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 5.5A2.5 2.5 0 016.5 3h11A2.5 2.5 0 0120 5.5v8A2.5 2.5 0 0117.5 16H10l-4.5 4v-4H6.5A2.5 2.5 0 014 13.5v-8z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ShareIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="18" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="6" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="18" cy="19" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.2 10.7l7.6-4.4M8.2 13.3l7.6 4.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function PencilIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 20l.9-3.6L15.6 5.7a1.5 1.5 0 012.1 0l1.6 1.6a1.5 1.5 0 010 2.1L8.6 20.1 4 20z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M14 7.5l3 3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function UserIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.5 20c1.3-3.7 4.4-5.5 7.5-5.5s6.2 1.8 7.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function SendIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 20l16-8L4 4l2 8-2 8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="currentColor" />
    </svg>
  );
}

export function LockIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="5" y="10.5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 10.5V7.5a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function MailIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PhoneIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1v3.4c0 .6-.4 1-1 1C10.7 21 3 13.3 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CopyIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function RefreshIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 4v4h-4M6 20v-4h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PauseIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

export function PlayIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M7 5v14l12-7z" />
    </svg>
  );
}

export function HandTapIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M9 12V6a1.5 1.5 0 0 1 3 0v5M12 11V5a1.5 1.5 0 0 1 3 0v6M15 11.5V8a1.5 1.5 0 0 1 3 0v6c0 3.5-2 6-5.5 6S6 17 6 14v-2.5c0-1 1.5-1.7 2.3-.7l.7 1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ShuffleIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 6h3.5l9 12H20M4 18h3.5l2.4-3.2M14 6h6M14 6l-2.4 3.2M17 3l3 3-3 3M17 21l3-3-3-3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StarIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l2.9 6.6L22 9.6l-5 4.9 1.2 7L12 18.1 5.8 21.5 7 14.5l-5-4.9 7.1-1z" />
    </svg>
  );
}

export function SpeakerIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
      <path d="M17 8a5 5 0 0 1 0 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function LeaveIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M10 17l5-5-5-5M15 12H3M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MapPinIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 21s7-6.1 7-11.5A7 7 0 105 9.5C5 14.9 12 21 12 21z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

// Duotone "player + game controller" illustrations for the Solo/Team pick
// screen, matching the pink/magenta character style from the mockup.
export function SoloPlayerIcon({ className = 'h-24 w-24' }) {
  return <img src="/icons/solo-player.png" alt="" className={`${className} object-contain`} aria-hidden="true" />;
}

export function TeamPlayersIcon({ className = 'h-24 w-24' }) {
  return <img src="/icons/team-players.png" alt="" className={`${className} object-contain`} aria-hidden="true" />;
}

// Decorative 4-point sparkle/star used around the "Ready To Play?" home
// banner, matching the design's gold star with a dark outline.
export function SparkleIcon({ className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 53 62" className={className} aria-hidden="true">
      <path
        d="M24.4131 2.19727C24.7519 0.267627 27.5215 0.267581 27.8604 2.19727L31.666 23.8945C31.6828 23.9902 31.753 24.0675 31.8467 24.0928L50.2275 29.0205C51.9567 29.4841 51.9567 31.9378 50.2275 32.4014L31.8467 37.3291C31.753 37.3544 31.6828 37.4317 31.666 37.5273L27.8604 59.2246C27.5215 61.1542 24.7519 61.1543 24.4131 59.2246L20.6074 37.5273C20.5907 37.4317 20.5205 37.3544 20.4268 37.3291L2.0459 32.4014C0.316736 31.9378 0.316758 29.4841 2.0459 29.0205L20.4268 24.0928C20.5205 24.0675 20.5907 23.9901 20.6074 23.8945L24.4131 2.19727Z"
        fill="#EFBE35"
        stroke="#453024"
        strokeWidth="1.5"
      />
    </svg>
  );
}

// "Online Play" glyph for the home hero card: a globe with a game
// controller plugged into it, traced from the design file's exact icon.
export function GlobeControllerIcon({ className = 'h-10 w-10' }) {
  return (
    <svg viewBox="0 0 104 104" fill="none" className={className} aria-hidden="true">
      <path
        d="M95.5502 69.9887C112.629 27.7387 66.1865 -11.7488 27.3002 11.9112C-2.59978 30.0625 -2.45353 74.2625 27.739 92.3975C32.398 95.196 37.505 97.1696 42.8352 98.2312C44.1404 98.8069 45.5522 99.1011 46.9786 99.0948C48.405 99.0885 49.8142 98.7818 51.1142 98.1946C52.4142 97.6075 53.5759 96.7531 54.5238 95.687C55.4716 94.621 56.1842 93.3673 56.6152 92.0075L59.3127 83.6062C59.5721 82.7889 60.0854 82.0755 60.778 81.5699C61.4706 81.0643 62.3065 80.7929 63.164 80.795H72.6052C73.4628 80.7929 74.2986 81.0643 74.9912 81.5699C75.6839 82.0755 76.1972 82.7889 76.4565 83.6062L79.154 92.0075C83.2977 104.114 101.14 99.4987 98.9302 86.8725L95.5502 69.9887ZM83.3627 56.9887H77.8377C77.706 56.7122 77.4989 56.4785 77.2401 56.3147C76.9813 56.1508 76.6815 56.0634 76.3752 56.0625H68.8027C69.0796 55.8484 69.2927 55.5626 69.4187 55.236C69.5447 54.9095 69.579 54.5546 69.5177 54.21C69.5135 53.1382 69.0858 52.1115 68.3279 51.3536C67.57 50.5957 66.5433 50.168 65.4715 50.1637H57.639C57.4235 50.1637 57.2168 50.0781 57.0645 49.9258C56.9121 49.7734 56.8265 49.5667 56.8265 49.3512C56.8265 49.1358 56.9121 48.9291 57.0645 48.7767C57.2168 48.6243 57.4235 48.5387 57.639 48.5387H78.1302C79.2006 48.5388 80.2273 48.1147 80.9856 47.3594C81.744 46.6041 82.1722 45.5791 82.1765 44.5087V40.625H94.3477C96.3792 48.0723 96.3792 55.9277 94.3477 63.375H93.9415C92.9435 61.4259 91.4288 59.7887 89.5631 58.6423C87.6974 57.496 85.5525 56.8846 83.3627 56.875V56.9887ZM52.4877 56.9887C50.298 56.9983 48.1531 57.6097 46.2874 58.7561C44.4216 59.9025 42.907 61.5397 41.909 63.4887H34.759C33.9138 55.929 33.9138 48.2985 34.759 40.7387H69.2252C69.404 42.3637 69.5502 43.875 69.6315 45.3862H57.639C56.5615 45.3862 55.5282 45.8143 54.7664 46.5761C54.0045 47.338 53.5765 48.3713 53.5765 49.4487C53.5765 50.5262 54.0045 51.5595 54.7664 52.3214C55.5282 53.0832 56.5615 53.5112 57.639 53.5112H65.4715C66.219 53.5112 66.3165 54.2587 66.2677 54.8437C66.2726 55.1044 66.3401 55.3601 66.4645 55.5892C66.589 55.8183 66.7667 56.014 66.9827 56.16H59.394C59.0877 56.1609 58.7879 56.2483 58.5291 56.4122C58.2704 56.576 58.0632 56.8097 57.9315 57.0862L52.4877 56.9887ZM38.3502 79.7387C36.9118 75.4688 35.8515 71.0806 35.1815 66.625H40.6252C40.7065 67.8437 38.5615 78.3087 38.269 79.7387H38.3502ZM8.12522 52C8.13563 48.1579 8.64916 44.3337 9.65272 40.625H31.4927C30.6802 48.1866 30.6802 55.8134 31.4927 63.375H9.60397C8.61705 59.6641 8.11991 55.8399 8.12522 52ZM43.1765 9.0675C41.282 11.0457 39.6789 13.2836 38.4152 15.7137C36.1814 14.9923 34.008 14.0958 31.9152 13.0325C35.4727 11.2084 39.2609 9.87456 43.1765 9.0675ZM52.0002 8.125C55.7377 8.125 59.3615 11.375 62.3677 16.64C58.9726 17.4585 55.4926 17.873 52.0002 17.875C48.5078 17.873 45.0279 17.4585 41.6327 16.64C44.639 11.375 48.2627 8.125 52.0002 8.125ZM72.0365 13C69.9437 14.0633 67.7703 14.9598 65.5365 15.6812C64.2728 13.2511 62.6697 11.0132 60.7752 9.035C64.6908 9.84206 68.479 11.1759 72.0365 13ZM52.0002 21.125C56.0029 21.1167 59.9885 20.6034 63.8627 19.5975C66.2922 25.2728 67.9325 31.2543 68.7377 37.375H35.1977C36.003 31.2543 37.6432 25.2728 40.0727 19.5975C43.968 20.6089 47.9758 21.1221 52.0002 21.125ZM72.8977 45.2725C72.8002 43.7612 72.6702 42.2012 72.4915 40.625H78.9915V44.4925C78.9872 44.7008 78.9015 44.8992 78.7526 45.0451C78.6037 45.1909 78.4036 45.2725 78.1952 45.2725H72.8977ZM61.019 59.2475H74.7502V63.18C74.759 63.2338 74.759 63.2887 74.7502 63.3425H61.0352C61.0264 63.2887 61.0264 63.2338 61.0352 63.18L61.019 59.2475ZM93.324 37.375H72.0852C71.2633 30.9335 69.5629 24.635 67.0315 18.655C69.9126 17.6776 72.6932 16.426 75.3352 14.9175C83.6854 20.1684 90.0227 28.0799 93.324 37.375ZM28.6652 14.9175C31.3072 16.426 34.0879 17.6776 36.969 18.655C34.4375 24.635 32.7372 30.9335 31.9152 37.375H10.6765C13.9778 28.0799 20.315 20.1684 28.6652 14.9175ZM10.6115 66.625H31.899C32.7347 73.0726 34.4458 79.3761 36.9852 85.3612C34.0845 86.3284 31.2867 87.5803 28.6327 89.0987C20.245 83.8745 13.8884 75.9474 10.6115 66.625ZM35.6202 92.625C34.3508 92.1525 33.1084 91.61 31.899 91C33.4426 90.2158 35.0326 89.5266 36.6602 88.9362C36.6724 90.5269 37.0623 92.092 37.7977 93.5025C37.0534 93.258 36.326 92.9649 35.6202 92.625ZM91.0977 95.4362C90.2252 95.731 89.3028 95.8499 88.384 95.7861C87.4652 95.7223 86.5682 95.477 85.7447 95.0646C84.9212 94.6521 84.1876 94.0805 83.5863 93.3828C82.9851 92.6852 82.528 91.8753 82.2415 91L79.6252 82.615C79.1554 81.1404 78.2279 79.8538 76.9772 78.9421C75.7266 78.0304 74.2179 77.5411 72.6702 77.545H63.164C61.6163 77.5411 60.1077 78.0304 58.857 78.9421C57.6064 79.8538 56.6788 81.1404 56.209 82.615L53.5277 91C53.0102 92.7277 51.8432 94.1876 50.272 95.073C48.7007 95.9584 46.8475 96.2004 45.1015 95.7481C43.3556 95.2958 41.8529 94.1845 40.9091 92.6477C39.9653 91.1108 39.6539 89.2679 40.0402 87.5062L42.4452 75.4C43.576 77.0852 45.1154 78.4564 46.9197 79.3855C48.724 80.3145 50.7343 80.7712 52.7629 80.7127C54.7915 80.6543 56.7722 80.0827 58.5201 79.0514C60.2679 78.02 61.7258 76.5625 62.7577 74.815C62.952 74.4436 62.9953 74.0115 62.8785 73.609C62.7617 73.2065 62.4939 72.8646 62.1311 72.6549C61.7682 72.4451 61.3383 72.3837 60.9312 72.4834C60.5242 72.5831 60.1713 72.8363 59.9465 73.19C59.1893 74.5179 58.0955 75.6227 56.7751 76.3929C55.4548 77.1632 53.9548 77.5718 52.4262 77.5774C50.8976 77.5831 49.3946 77.1856 48.0687 76.425C46.7427 75.6645 45.6407 74.5678 44.8738 73.2456C44.1069 71.9233 43.7022 70.4222 43.7004 68.8936C43.6987 67.365 44.1 65.863 44.8639 64.539C45.6278 63.215 46.7273 62.1158 48.0515 61.3523C49.3758 60.5887 50.8779 60.1878 52.4065 60.19H57.769V63.1962C57.7312 63.6131 57.7768 64.0333 57.9031 64.4323C58.0294 64.8313 58.2339 65.2012 58.5046 65.5204C58.7754 65.8395 59.107 66.1016 59.4801 66.2912C59.8532 66.4809 60.2603 66.5943 60.6777 66.625H75.0915C75.5104 66.5944 75.919 66.4805 76.2932 66.2898C76.6675 66.0991 76.9999 65.8356 77.2708 65.5146C77.5418 65.1937 77.7459 64.8219 77.8712 64.4209C77.9964 64.02 78.0403 63.5981 78.0002 63.18V60.125H83.3627C84.8913 60.1228 86.3934 60.5237 87.7177 61.2873C89.0419 62.0508 90.1414 63.15 90.9053 64.474C91.6692 65.798 92.0705 67.3 92.0688 68.8286C92.0671 70.3572 91.6623 71.8583 90.8954 73.1805C90.1285 74.5028 89.0265 75.5995 87.7006 76.36C86.3746 77.1206 84.8716 77.5181 83.343 77.5124C81.8144 77.5068 80.3144 77.0982 78.9941 76.3279C77.6738 75.5577 76.5799 74.4529 75.8227 73.125C75.5979 72.7713 75.2451 72.5181 74.838 72.4184C74.4309 72.3187 74.001 72.3801 73.6381 72.5899C73.2753 72.7996 73.0075 73.1415 72.8907 73.544C72.7739 73.9465 72.8172 74.3786 73.0115 74.75C74.0738 76.5543 75.586 78.0523 77.4003 79.0976C79.2145 80.1429 81.2689 80.6997 83.3627 80.7137C85.3384 80.711 87.2826 80.2182 89.0211 79.2795C90.7596 78.3408 92.238 76.9855 93.324 75.335L95.7452 87.4412C96.0953 89.121 95.8151 90.8708 94.958 92.3572C94.1009 93.8436 92.7269 94.9627 91.0977 95.5012V95.4362ZM56.8752 68.25C56.8752 68.681 56.704 69.0943 56.3993 69.399C56.0945 69.7038 55.6812 69.875 55.2502 69.875H53.6252V71.5C53.6252 71.931 53.454 72.3443 53.1493 72.649C52.8445 72.9538 52.4312 73.125 52.0002 73.125C51.5692 73.125 51.1559 72.9538 50.8512 72.649C50.5464 72.3443 50.3752 71.931 50.3752 71.5V69.875H48.7502C48.3192 69.875 47.9059 69.7038 47.6012 69.399C47.2964 69.0943 47.1252 68.681 47.1252 68.25C47.1252 67.819 47.2964 67.4057 47.6012 67.1009C47.9059 66.7962 48.3192 66.625 48.7502 66.625H50.3752V65C50.3752 64.569 50.5464 64.1557 50.8512 63.8509C51.1559 63.5462 51.5692 63.375 52.0002 63.375C52.4312 63.375 52.8445 63.5462 53.1493 63.8509C53.454 64.1557 53.6252 64.569 53.6252 65V66.625H55.2502C55.6812 66.625 56.0945 66.7962 56.3993 67.1009C56.704 67.4057 56.8752 67.819 56.8752 68.25ZM85.394 71.1587C85.4164 71.3721 85.3965 71.5879 85.3356 71.7936C85.2746 71.9993 85.1737 72.191 85.0387 72.3578C84.9036 72.5245 84.7371 72.663 84.5485 72.7654C84.3599 72.8677 84.153 72.932 83.9396 72.9544C83.7262 72.9768 83.5105 72.9569 83.3048 72.896C83.099 72.835 82.9073 72.7341 82.7406 72.5991C82.5738 72.464 82.4353 72.2974 82.333 72.1089C82.2306 71.9203 82.1664 71.7134 82.144 71.5C82.1216 71.2866 82.1414 71.0709 82.2024 70.8652C82.2633 70.6594 82.3642 70.4677 82.4993 70.301C82.6343 70.1342 82.8009 69.9957 82.9895 69.8934C83.1781 69.791 83.385 69.7268 83.5984 69.7044C83.8118 69.682 84.0275 69.7018 84.2332 69.7628C84.4389 69.8237 84.6306 69.9246 84.7974 70.0597C84.9641 70.1947 85.1026 70.3613 85.205 70.5499C85.3074 70.7384 85.3716 70.9454 85.394 71.1587ZM82.144 65.3412C82.1216 65.1278 82.1414 64.9121 82.2024 64.7064C82.2633 64.5007 82.3642 64.309 82.4993 64.1422C82.6343 63.9755 82.8009 63.837 82.9895 63.7346C83.1781 63.6322 83.385 63.568 83.5984 63.5456C83.8118 63.5232 84.0275 63.5431 84.2332 63.604C84.4389 63.665 84.6306 63.7659 84.7974 63.9009C84.9641 64.036 85.1026 64.2025 85.205 64.3911C85.3074 64.5797 85.3716 64.7866 85.394 65C85.4164 65.2134 85.3965 65.4291 85.3356 65.6348C85.2746 65.8406 85.1737 66.0323 85.0387 66.199C84.9036 66.3658 84.7371 66.5043 84.5485 66.6066C84.3599 66.709 84.153 66.7732 83.9396 66.7956C83.7262 66.818 83.5105 66.7982 83.3048 66.7372C83.099 66.6763 82.9073 66.5754 82.7406 66.4403C82.5738 66.3053 82.4353 66.1387 82.333 65.9501C82.2306 65.7615 82.1664 65.5546 82.144 65.3412ZM85.1665 68.25C85.1665 67.7888 85.3497 67.3466 85.6758 67.0205C86.0018 66.6944 86.4441 66.5112 86.9052 66.5112C87.3664 66.5112 87.8086 66.6944 88.1347 67.0205C88.4608 67.3466 88.644 67.7888 88.644 68.25C88.644 68.7111 88.4608 69.1534 88.1347 69.4795C87.8086 69.8056 87.3664 69.9887 86.9052 69.9887C86.4441 69.9887 86.0018 69.8056 85.6758 69.4795C85.3497 69.1534 85.1665 68.7111 85.1665 68.25ZM78.894 68.25C78.9359 67.8158 79.1381 67.4127 79.461 67.1194C79.784 66.8262 80.2046 66.6637 80.6409 66.6637C81.0771 66.6637 81.4977 66.8262 81.8207 67.1194C82.1436 67.4127 82.3458 67.8158 82.3877 68.25C82.3458 68.6842 82.1436 69.0873 81.8207 69.3806C81.4977 69.6738 81.0771 69.8363 80.6409 69.8363C80.2046 69.8363 79.784 69.6738 79.461 69.3806C79.1381 69.0873 78.9359 68.6842 78.894 68.25Z"
        fill="currentColor"
      />
    </svg>
  );
}

