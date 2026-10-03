const ApachetaLogo = ({ size = 40, className = "" }) => (
  <svg
    viewBox="0 0 64 64"
    width={size}
    height={size}
    fill="currentColor"
    className={"apacheta-symbol " + className}
    aria-hidden="true"
    focusable="false"
  >
    <path d="M12 49c4-4 13-5 22-4l14 1c4 0 6 3 5 6-2 3-8 4-16 4l-20-1c-6 0-9-3-5-6Z" />
    <path d="M17 36c5-3 14-4 23-3l7 2c4 1 5 4 2 7-3 2-11 2-20 2l-11-1c-5-1-5-5-1-7Z" />
    <path d="M22 24c3-2 9-3 15-2l5 2c3 2 3 5-1 7l-16 1c-5-1-7-5-3-8Z" />
    <path d="M26 14c4-2 10-2 13 0 3 2 3 5 0 6-3 1-8 1-12 0-4-1-4-4-1-6Z" />
    <path d="M29 5c2-2 5-2 7 0 2 2 2 4 0 6l-7 1c-3-1-3-5 0-7Z" />
  </svg>
);
export default ApachetaLogo;
