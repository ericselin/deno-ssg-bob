/** @jsx h */

import { h } from "../../../../../edge/mod.ts";
import type { EdgeComponent } from "../../../../../edge/mod.ts";

const UserAgent: EdgeComponent = (_props, req) => (
    <p>
      You are using {req.headers.get("User-Agent")}
    </p>
  );

export default UserAgent;
