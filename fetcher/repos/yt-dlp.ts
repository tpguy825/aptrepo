import { join as j } from "path";
import { poolpath } from "../index.ts";
import fs from "fs/promises";
import { tmpdir as gettmpdir } from "os";
import { createReadStream, createWriteStream, existsSync } from "fs";

async function md(...paths: string[]) {
	return fs.mkdir(j(...paths), {
		recursive: true,
	});
}

async function badcopy(from: string, to: string) {
	return new Promise<void>((resolve, reject) => {
		// this looks horrid
		const stream = createReadStream(from).pipe(createWriteStream(to));
		stream.on("finish", () => resolve());
		stream.on("error", (e) => reject(e));
	});
}

export default {
	repo: "yt-dlp/yt-dlp",
	fileNameEnding: null,
	fileNamePrefix: "yt-dlp_linux",
	skipchecks: true,
	async eachFile(name, contents, { tag_name: version }) {
		let platform = "", arch = "";
		// console.log("hi", name);
		
		switch (name) {
			case "yt-dlp_linux":
				arch = "amd64";
				platform = "linux";
				break;
			case "yt-dlp_linux_aarch64":
				arch = "arm64";
				platform = "linux";
				break;
			default:
				return false;
		}
			
		if (!platform || !arch || platform !== "linux") return false;
		if (arch === "armv7") arch = "armhf"; // raspberry pi
		else if (arch !== "amd64" && arch !== "arm64") return false;
		const debname = ["yt-dlp", version, arch].join("_") + ".deb";

		if (existsSync(j(poolpath, "f", "yt-dlp", debname))) return false;

		const tmpdir = await fs.mkdtemp(j(gettmpdir(), "aptrepo-ytdlp-"));
		const tmpexec = j(tmpdir, "yt-dlp");
		// j and await hell below
		const cont = await contents();
		await fs.writeFile(tmpexec, cont);

		await md(tmpdir, ["yt-dlp", version, arch].join("_"), "DEBIAN");
		await md(tmpdir, ["yt-dlp", version, arch].join("_"), "usr/bin");

		await fs.rename(j(tmpdir, "yt-dlp"), j(tmpdir, ["yt-dlp", version, arch].join("_"), "usr/bin/yt-dlp"));
		await fs.writeFile(
			j(tmpdir, ["yt-dlp", version, arch].join("_"), "DEBIAN/control"),
			`Package: yt-dlp
Version: ${version}
Maintainer: Junegunn Choi <junegunn.c@gmail.com>
` + //Depends: libc6
				`Architecture: ${arch}
Homepage: https://github.com/yt-dlp/yt-dlp
Installed-Size: ${cont.length}
Description: yt-dlp is a feature-rich command-line audio/video downloader with support for thousands of sites.
`,
		);
		await Bun.$`dpkg --build ${j(tmpdir, ["yt-dlp", version, arch].join("_"))}`.cwd(tmpdir);
		// must use badcopy as rename throws EXDEV ???
		await badcopy(j(tmpdir, debname), j(poolpath, debname));
		return j(poolpath, debname);
	},
} satisfies RepoConfig;


