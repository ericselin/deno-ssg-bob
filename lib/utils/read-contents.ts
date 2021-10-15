export const readContents = (filepath: string): Promise<string> => Deno.readTextFile(filepath);
