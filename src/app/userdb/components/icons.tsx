export const DashboardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <rect x="3" y="3" width="8" height="8" rx="2" className="fill-current" />
    <rect x="13" y="3" width="8" height="6" rx="2" className="fill-current opacity-70" />
    <rect x="3" y="13" width="6" height="8" rx="2" className="fill-current opacity-70" />
    <rect x="11" y="13" width="10" height="8" rx="2" className="fill-current" />
  </svg>
);

export const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <rect x="3" y="5" width="18" height="16" rx="2" className="stroke-current" strokeWidth="1.5" />
    <path d="M8 3v4M16 3v4" className="stroke-current" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M3 10h18" className="stroke-current" strokeWidth="1.5" />
  </svg>
);

export const GiftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <rect x="3" y="8" width="18" height="13" rx="2" className="stroke-current" strokeWidth="1.5" />
    <path d="M12 8v13" className="stroke-current" strokeWidth="1.5" />
    <path d="M3 12h18" className="stroke-current" strokeWidth="1.5" />
    <path
      d="M12 8c1.5-2.5.5-4-1.5-4S6 5.5 8 8h4Zm0 0c-1.5-2.5-.5-4 1.5-4S18 5.5 16 8h-4Z"
      className="stroke-current"
      strokeWidth="1.5"
    />
  </svg>
);


export const LogoutIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4"
      className="stroke-current"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M14 16l4-4-4-4"
      className="stroke-current"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M11 12h7" className="stroke-current" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
