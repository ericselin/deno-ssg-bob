import type { DirtyCheckerCreator } from "../domain.ts";

const allDirtyOnForce: DirtyCheckerCreator = ({force, log}) => {
  log?.warning("Marking all files dirty because of force build");

  return () => Boolean(force);
};

export default allDirtyOnForce;
