/** @jsx h */

import { Component, h } from "../../../mod.ts";

const Base: Component = (_, { page: { content } }) => {
  return (
    <div>
      <Drugs drugs={["rick", "morty"]} />
      <div>
        {content}
      </div>
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
