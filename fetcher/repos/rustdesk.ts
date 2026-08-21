import { defaultEachFile } from "../index.ts";
export default {
	repo: "rustdesk/rustdesk",
	eachFile(name, contents, release) {
		if (name.includes("sciter")) return false;
		return defaultEachFile(name, contents);
	},
} satisfies RepoConfig;
