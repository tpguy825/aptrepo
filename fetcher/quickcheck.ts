import fs from "fs/promises";
import path from "path";

if (typeof Bun === "undefined") {
	const { config } = await import("dotenv");
	config();
}

if (!process.env.GITHUB_TOKEN) throw new Error("no github token, will be ratelimited")

let longestrepo = 0;
async function getLatest(repo: RepoConfig) {
	const latest = await fetch(`https://api.github.com/repos/${repo.repo}/releases`, {
		headers: {
			"User-Agent": "fetcher/1.0 (https://github.com/tpguy825/aptrepo)",
			Authorization: "Bearer " + process.env.GITHUB_TOKEN,
		},
		cache: "no-cache",
	}).then((r) => r.json() as Promise<Release[]>);
	if (!latest[0]) return console.error(latest);

	return {
		repo: repo.repo, // what
		ver: latest[0]!.tag_name,
		date: Intl.DateTimeFormat("en-gb", {
			dateStyle: "long",
			timeStyle: "medium",
		}).format(new Date(latest[0]!.published_at)),
		_date: new Date(latest[0]!.published_at).getTime(),
	};
}

let strs = [];
for (const repo of await fs.readdir("repos")) {
	try {
		const r = await (import(path.join(import.meta.dirname, "repos", repo)) as Promise<{ default: RepoConfig }>);
		if (r.default.repo.length > longestrepo) longestrepo = r.default.repo.length;
		const str = getLatest(r.default);
		strs.push(str);
	} catch (e) {
		console.error(e);
	}
}
console.table(
	(await Promise.all(strs)).sort((a, b) => b!._date - a!._date),
	["repo", "ver", "date"],
);

