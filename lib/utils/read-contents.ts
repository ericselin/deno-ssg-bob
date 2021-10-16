export function readContents(filepath: string): Promise<string>;
export function readContents(filepaths: string[]): Promise<string>;

export async function readContents(filepath: string | string[]) {
  if (typeof filepath === "string") {
    return Deno.readTextFile(filepath);
  } else {
    return (await Promise.all(filepath.map((path) => Deno.readTextFile(path))))
      .join("\n");
  }
}
