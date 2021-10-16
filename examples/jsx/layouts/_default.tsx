/** @jsx h */

import { Component, h } from "../../mod.ts";

const Base: Component = ({ children }) => {
  return (
    <div>
      <Drugs drugs={["rick", "morty"]} />
      <div dangerouslySetInnerHTML={{ __html: children }} />
    </div>
  );
};

const Drugs = (props: { drugs: string[] }) => {
  return (
    <div>
      {props.drugs.map((drug) => <div>{drug}</div>)}
    </div>
  );
};

export default Base;
