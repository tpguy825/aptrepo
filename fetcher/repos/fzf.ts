import { join as j } from "path";
import { firstchar, poolpath, truncate, type RepoConfig } from "..";
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
		const stream = createReadStream(from).pipe(createWriteStream(to))
		stream.on("finish", () => resolve());
		stream.on("error", (e) => reject(e));
	})
}

export default {
	repo: "junegunn/fzf",
	fileNameEnding: ".tar.gz",
	async eachFile(name, contents) {
		const [_fzf, version, platarch] = truncate(name, ".tar.gz".length).split("-");
		if (!platarch) return false;
		let [platform, arch] = platarch.split("_");
		if (!platform || !arch || platform !== "linux") return false;
		if (arch === "armv7") arch = "armhf"; // raspberry pi
		else if (arch !== "amd64" && arch !== "arm64") return false;
		const debname = ["fzf", version, arch].join("_") + ".deb";

		if (existsSync(j(poolpath, "f", "fzf", debname))) return false;

		const tmpdir = await fs.mkdtemp(j(gettmpdir(), "aptrepo-fzf-"));
		const tmptar = j(tmpdir, "fzf.tar.gz");
		// join and await hell below
		await fs.writeFile(tmptar, await contents());
		await Bun.$`tar xf ${tmptar}`.cwd(tmpdir);

		await md(tmpdir, ["fzf", version, arch].join("_"), "DEBIAN");
		await md(tmpdir, ["fzf", version, arch].join("_"), "usr/bin");

		await fs.rename(j(tmpdir, "fzf"), j(tmpdir, ["fzf", version, arch].join("_"), "usr/bin/fzf"));
		await fs.writeFile(
			j(tmpdir, ["fzf", version, arch].join("_"), "DEBIAN/control"),
			// is libc needed? no idea
			`Package: fzf
Version: ${version}
Maintainer: Junegunn Choi <junegunn.c@gmail.com>
` + //Depends: libc6
				`Architecture: ${arch}
Homepage: https://github.com/junegunn/fzf
Description: fzf is a general-purpose command-line fuzzy finder.
`,
		);
		await Bun.$`dpkg --build ${j(tmpdir, ["fzf", version, arch].join("_"))}`.cwd(tmpdir);
		// must use badcopy as rename throws EXDEV ???
		await badcopy(j(tmpdir, debname), j(poolpath, debname));
		return j(poolpath, debname);
	},
} satisfies RepoConfig;

