import type { FilePath, Filter } from "../domain.ts";

const combineFilters = (filters: Filter[]): Filter =>
  (options) => {
    const callableFilters = filters.map((filter) => filter(options));
    return async (filepath): Promise<FilePath | undefined> =>
      await callableFilters
        .reduce(
          (chain, filter) =>
            chain.then((filepath) => {
              if (typeof filepath === "undefined") return undefined;
              return filter(filepath);
            }),
          Promise.resolve(filepath as FilePath | undefined),
        );
  };

export default combineFilters;
