type MaybeString = string | undefined;

export function readContents(filepath: MaybeString): Promise<MaybeString>;
export function readContents(filepaths: (MaybeString)[]): Promise<MaybeString>;

export async function readContents(filepath: MaybeString | MaybeString[]) {
  if (!filepath) return;
  if (typeof filepath === "string") {
    return Deno.readTextFile(filepath);
  } else {
    return (await Promise.all(
      filepath.map((path) => path && Deno.readTextFile(path)),
    ))
      .filter(Boolean)
      .join("\n");
  }
}
