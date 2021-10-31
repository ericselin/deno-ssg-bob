import { path } from "../deps.ts";
import type {
  FileReader,
  OutputFileWriterCreator,
  Location,
  StaticFileWriterCreator,
} from "../domain.ts";
import { ContentType } from "../domain.ts";

export type DirectoryPath = string;

export const readContentFile: FileReader = () =>
  async (location) => {
    if (location.type === ContentType.Page) {
      const content = await Deno.readTextFile(location.inputPath);
      location
      return {
        type: ContentType.Page,
        location: location as Location<ContentType.Page>,
        content,
      };
    } else {
      return {
        type: ContentType.Static,
        location: location as Location<ContentType.Static>,
      };
    }
  };

export const createOutputFileWriter: OutputFileWriterCreator = ({ log }) =>
  async (
    outputFile,
  ) => {
    await Deno.mkdir(path.dirname(outputFile.path), { recursive: true });
    await Deno.writeTextFile(outputFile.path, outputFile.output);
    log?.info(`Wrote file ${outputFile.path} to disk`);
  };

export const createStaticFileWriter: StaticFileWriterCreator = ({ log }) =>
  async ({ location }) => {
    await Deno.mkdir(path.dirname(location.outputPath), { recursive: true });
    await Deno.copyFile(location.inputPath, location.outputPath);
    log?.info(`Copied static file to ${location.outputPath}`);
  };
