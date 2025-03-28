export const formatProgressMessage = {
  begin(strings: TemplateStringsArray, ...args: string[]) {
    const message = !args.length
      ? strings[0]
      : args.reduce((acc, arg, index) => {
          return acc + arg + strings[index + 1];
        }, strings[0]);

    return `🔄 Beginning: ${message}`;
  },
  end(strings: TemplateStringsArray, ...args: string[]) {
    const message = !args.length
      ? strings[0]
      : args.reduce((acc, arg, index) => {
          return acc + arg + strings[index + 1];
        }, strings[0]);
    return `✅ Completed: ${message}`;
  },
  error(strings: TemplateStringsArray, ...args: string[]) {
    const message = !args.length
      ? strings[0]
      : args.reduce((acc, arg, index) => {
          return acc + arg + strings[index + 1];
        }, strings[0]);
    return `❌ Error: ${message}`;
  },
};

export const formatDateTimestamp = (timestamp: number) => {
  if (!timestamp) return '';
  return new Date(timestamp).toISOString();
};
