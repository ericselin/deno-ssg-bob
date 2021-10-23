import type { DirtyCheckerCreator } from "../../domain.ts";

const allDirtyOnForce: DirtyCheckerCreator = ({ force, log }) => {
  if (force) {
    log?.warning("Marking all files dirty because of force build");
  }

  return () => Boolean(force);
};

export default allDirtyOnForce;
