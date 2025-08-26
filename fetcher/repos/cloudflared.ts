import { defaultEachFile, type RepoConfig } from "..";

export default {
	repo: "cloudflare/cloudflared",
	eachFile(name, contents, release) {
		if (name === "cloudflared-linux-arm.deb" || name.startsWith("cloudflared-fips")) return false;
		return defaultEachFile(name.replaceAll("-", "_").replace("_linux_", "_" + release.tag_name + "_"), contents);
	},
} satisfies RepoConfig;


