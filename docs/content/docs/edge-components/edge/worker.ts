import { edgeRequestHandler } from "../../../../../mod.ts";
import UserAgent from "./UserAgent.tsx";

const components = {
  [UserAgent.name]: UserAgent,
};

export default { fetch: edgeRequestHandler(components) };
