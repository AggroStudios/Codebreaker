const codeBase = {
  fontFamily: `'Fira Code', 'Fira Code VF', 'source-code-pro', Menlo, Monaco, Consolas, 'Courier New', monospace`,
  fontWeight: 700,
  letterSpacing: `0.15em`,
  //textTransform: `uppercase`,
}

const terminalBase = {
  fontFamily: `'ibm_vga', monospace`,
}

export default {
  fontFamily: `'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif`,
  fontSize: 14,
  htmlFontSize: 10,
  lineHeight: 19,
  //Custom typography props
  code1: {
    ...codeBase,
    fontSize: 24,
    textTransform: `uppercase`,
  },
  code2: {
    ...codeBase,
    fontSize: 20,
    textTransform: `uppercase`,
  },
  code3: {
    ...codeBase,
    fontSize: 16,
    textTransform: `uppercase`,
  },
  code4: {
    ...codeBase,
    fontSize: 14,
    textTransform: `uppercase`,
  },
  code5: {
    ...codeBase,
    fontSize: 12,
    textTransform: `uppercase`,
  },
  terminal1: {
    ...terminalBase,
    fontSize: 18,
  },
  terminal2: {
    ...terminalBase,
    fontSize: 16,
  },
  terminal3: {
    ...terminalBase,
    fontSize: 14,
  },
  terminal4: {
    ...terminalBase,
    fontSize: 12,
  },
  //Standard typography props
  body1: {
    fontSize: 16,
  },
  body2: {
    fontSize: 14,
  },
  button: {
    fontSize: 16,
  },
  caption: {
    fontSize: 12,
  },
  input: {
    fontSize: 16,
  },
  h1: {
    fontSize: 22,
    fontWeight: 700,
  },
  h2: {
    fontSize: 20,
    fontWeight: 700,
  },
  h3: {
    fontSize: 19,
    fontWeight: 700,
  },
  h4: {
    fontSize: 18,
    fontWeight: 700,
  },
  h5: {
    fontSize: 17,
    fontWeight: 700,
  },
  h6: {
    fontSize: 16,
    fontWeight: 700,
  },
};
