import { defaultEachFile } from "..";

export default {
	repo: "git-ecosystem/git-credential-manager",
	eachFile: async (name: string, contents: () => Promise<Buffer>) => {
		const ver = name.split(".").slice(1, -1).join();
		const fixedname = `gcm_${ver}_amd64.deb`;
		return defaultEachFile(fixedname, contents);
	}

} satisfies RepoConfig