import { defaultEachFile } from "..";

export default {
	repo: "git-ecosystem/git-credential-manager",
	fileNamePrefix: "gcm-linux-",
	eachFile: async (name: string, contents: () => Promise<Buffer>) => {
		const ver = name.split(".").slice(1, -1).join();
		let arch = name.split("-")[2];
		if (arch == "x64") arch = "amd64";
		else if (arch !== "arm64") return false;
		const fixedname = `gcm_${ver}_${arch}.deb`;
		return defaultEachFile(fixedname, contents);
	}

} satisfies RepoConfig