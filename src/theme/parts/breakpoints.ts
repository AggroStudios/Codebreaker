declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xx: true;
  }
}

const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
  xx: 1700,
};

export default breakpoints;
