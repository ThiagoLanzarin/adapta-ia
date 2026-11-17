/** Brand mark: a sheet with two steps and a check, in a rounded teal square. */
export default function Logo({ className = 'size-9' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 40 40" className={className}>
      <rect width="40" height="40" rx="11" fill="#0f766e" />
      <rect x="10" y="8" width="20" height="24" rx="3.5" fill="#fff" />
      <circle cx="15" cy="15" r="2.2" fill="#14b8a6" />
      <rect x="19" y="13.8" width="7" height="2.4" rx="1.2" fill="#99f6e4" />
      <circle cx="15" cy="22" r="2.2" fill="#f59e0b" />
      <rect x="19" y="20.8" width="7" height="2.4" rx="1.2" fill="#fde68a" />
      <path
        d="M23 30.5l3.2 3.2 6.3-6.6"
        fill="none"
        stroke="#0f766e"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23 30.5l3.2 3.2 6.3-6.6"
        fill="none"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
