import { ConfigFile, ContentImporter } from "../../../../mod.ts";

async function* getContent(): ContentImporter {
  yield { contentPath: "/page.md", data: { title: "Page" } };
}

export default <ConfigFile> {
  contentImporter: getContent(),
};
