import ansiEscapes from "ansi-escapes";

console.log(new String(ansiEscapes.clearTerminal))
process.stdout.write(ansiEscapes.clearTerminal)
