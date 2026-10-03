const paths = {
  home: "M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9",
  clients:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.87",
  search: "m21 21-4.35-4.35",
  plus: "M12 5v14M5 12h14",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  back: "M19 12H5m6-6-6 6 6 6",
  logout: "M9 4H4v16h5M10 12h11m-5-5 5 5-5 5",
  refresh:
    "M20 7v5h-5M4 17v-5h5M6.3 6.3a8 8 0 0 1 13.2 3.2M17.7 17.7a8 8 0 0 1-13.2-3.2",
  close: "m6 6 12 12M6 18 18 6",
  check: "m5 12 4 4L19 6",
  alert:
    "M12 8v5m0 4h.01M10.3 3.7 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0",
};
const Icon = ({ name, size = 20, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    className={"ui-icon " + className}
  >
    {name === "search" && <circle cx="10.5" cy="10.5" r="6.5" />}
    {name === "clients" && <circle cx="9" cy="7" r="4" />}
    <path d={paths[name] || paths.arrow} />
  </svg>
);
export default Icon;
