import { existsSync } from "fs";
import fs from "fs/promises";
import path from "path";

export const defaultEachFile = async (name: string, contents: () => Promise<Buffer>) => {
	const filepath = path.join(poolpath, name);
	const filepath2 = path.join(poolpath, firstchar(name), name.split("_")[0]!.trim(), name);

	if (existsSync(filepath) || existsSync(filepath2)) return false;
	await fs.writeFile(filepath, await contents());
	return filepath;
};

export function firstchar(t: string) {
	return t.slice(0, 1);
}
/** remove amount chars from end of t */
export function truncate(t: string, amount: number) {
	return t.slice(0, t.length - amount);
}
export const poolpath = path.join(import.meta.dirname, "..", "apt-repo/pool/main");

async function getLatest(repo: RepoConfig) {
	console.log(repo.repo);

	const latest = await fetch(`https://api.github.com/repos/${repo.repo}/releases`, {
		headers: {
			"User-Agent": "fetcher/1.0 (https://github.com/tpguy825/aptrepo)",
			Authorization: "Bearer " + process.env.GITHUB_TOKEN,
		},
		cache: "no-cache",
	}).then((r) => r.json() as Promise<Release[]>);
	if (!latest[0]) return console.error(latest);

	for (const file of latest[0].assets) {
		// evil murderous if statement that will eat your family
		if (
			(repo.fileNameEnding !== null && !file.name.endsWith(repo.fileNameEnding ?? ".deb")) ||
			(repo.fileNamePrefix !== null && !file.name.startsWith(repo.fileNamePrefix ?? "")) ||
			!file.name.includes("linux") ||
			(repo.skipchecks
				? false
				: (!file.name.includes("amd64") &&
						!file.name.includes("arm64") &&
						!file.name.includes("armhf") &&
						!file.name.includes("armv7")) ||
				  file.name.includes("musl-linux"))
		)
			continue;

		const eachFile = repo.eachFile ?? defaultEachFile;
		const filepath = await eachFile(
			file.name,
			() =>
				fetch(file.browser_download_url, {
					headers: {
						"User-Agent": "fetcher/1.0 (https://github.com/tpguy825/aptrepo)",
						Authorization: "Bearer " + process.env.GITHUB_TOKEN,
					},
				})
					.then((r) => r.arrayBuffer())
					.then((r) => Buffer.from(r)),
			latest[0],
		);
		if (!filepath) continue;
		// use reprepro from https://gitlab.com/packaging/reprepro-multiple-versions
		await Bun.$`reprepro -b ../apt-repo -S utils -P optional includedeb stable ${filepath}`;
		await fs.unlink(filepath);
	}
}

if (import.meta.main) {
	for (const repo of await fs.readdir("repos")) {
		await (import(path.join(__dirname, "repos", repo)) as Promise<{ default: RepoConfig }>).then((r) =>
			getLatest(r.default),
		);
	}
	// await Bun.$`git add ../apt-repo && git commit -m "automated: update repo" && git push`.nothrow();
}
