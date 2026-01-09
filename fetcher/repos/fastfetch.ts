import { defaultEachFile } from "../index.ts";

export default {
	repo: "fastfetch-cli/fastfetch",
	eachFile(name, contents, release) {
		if (name.includes("polyfill")) return false;
		return defaultEachFile(name.replaceAll("-", "_").replace("_linux_", "_" + release.tag_name + "_"), contents);
	},
} satisfies RepoConfig;
