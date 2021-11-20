/** @jsx edge */

import { edge } from "../../../../../mod.ts";
import type { EdgeComponent } from "../../../../../mod.ts";

const UserAgent: EdgeComponent = (_props, req) => (
    <p>
      You are using {req.headers.get("User-Agent")}
    </p>
  );

export default UserAgent;
