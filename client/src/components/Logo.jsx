const Logo = ({ size = 40, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Background circle with gradient */}
    <defs>
      <linearGradient id="logoBg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#7c3aed" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
      <linearGradient id="chatBubble" x1="12" y1="16" x2="52" y2="52" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#e0d5ff" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#logoBg)" />

    {/* Chat bubble */}
    <path
      d="M16 22C16 19.79 17.79 18 20 18H44C46.21 18 48 19.79 48 22V36C48 38.21 46.21 40 44 40H30L22 47V40H20C17.79 40 16 38.21 16 36V22Z"
      fill="url(#chatBubble)"
      opacity="0.95"
    />

    {/* Incognito mask / eye-line */}
    <ellipse cx="28" cy="29" rx="4" ry="3.5" fill="#7c3aed" opacity="0.8" />
    <ellipse cx="38" cy="29" rx="4" ry="3.5" fill="#7c3aed" opacity="0.8" />
    <path
      d="M22 28.5C23.5 25.5 26 24.5 28 24.5C30 24.5 31.5 25.5 33 27C34.5 25.5 36 24.5 38 24.5C40 24.5 42 25.5 44 28.5"
      stroke="#7c3aed"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
      opacity="0.6"
    />
    {/* Eyes */}
    <circle cx="28" cy="29.5" r="1.5" fill="white" />
    <circle cx="38" cy="29.5" r="1.5" fill="white" />
  </svg>
);

export default Logo;
