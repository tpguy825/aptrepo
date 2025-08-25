import { existsSync } from "fs";
import fs from "fs/promises";
import path from "path";

async function getLatest(repo: string) {
	const latest = await fetch(`https://api.github.com/repos/${repo}/releases`, {
		headers: { "User-Agent": "fetcher/1.0 (https://github.com/tpguy825/aptrepo)" },
	}).then((r) => r.json() as Promise<Release[]>);
	if (!latest[0]) return console.error(latest);

	for (const file of latest[0].assets) {
		if (
			!file.name.endsWith(".deb") ||
			file.name.includes("musl-linux") ||
			file.name.includes("386") ||
			file.name.includes("i686") ||
			file.name === "cloudflared-linux-arm.deb"
		)
			continue;
		const filepath = path.join(__dirname, "..", "apt-repo/pool/main", file.name);
		const filepath2 = path.join(
			__dirname,
			"..",
			"apt-repo/pool/main",
			file.name.slice(0, 1),
			// cloudflared uses dashes not underscores and breaks this when put into reprepro
			file.name.includes("_") ? file.name.split("_")[0]!.trim() : file.name.split("_").slice(0, -2).join("-").trim(),
			file.name,
		);
		console.log("Ckecking", filepath, "and", filepath2);
		
		if (existsSync(filepath) || existsSync(filepath2)) continue;
		const buf = await fetch(file.browser_download_url, {
			headers: { "User-Agent": "fetcher/1.0 (https://github.com/tpguy825/aptrepo)" },
		}).then((r) => r.arrayBuffer());
		await fs.writeFile(filepath, Buffer.from(buf));
		await Bun.$`reprepro -b ../apt-repo includedeb stable ${filepath}`;
		await fs.unlink(filepath);
	}
}

const repos = (await fs.readFile("repos.txt", "utf8"))
	.split("\n")
	.map((t) => t.trim())
	.filter((t) => t.length > 0);
for (const repo of repos) {
	if (!repo) throw new Error("Must provide repo in format author/name");
	await getLatest(repo);
}

await Bun.$`git add ../apt-repo && git commit -m "automated: update repo" && git push`.nothrow();

interface Release {
	url: string;
	assets_url: string;
	upload_url: string;
	html_url: string;
	id: number;
	author: Author;
	node_id: string;
	tag_name: string;
	target_commitish: string;
	name: string;
	draft: boolean;
	immutable: boolean;
	prerelease: boolean;
	created_at: string;
	updated_at: string;
	published_at: string;
	assets: Asset[];
	tarball_url: string;
	zipball_url: string;
	body: string;
	reactions?: Reactions;
	mentions_count?: number;
}

interface Reactions {
	url: string;
	total_count: number;
	"+1": number;
	"-1": number;
	laugh: number;
	hooray: number;
	confused: number;
	heart: number;
	rocket: number;
	eyes: number;
}

interface Asset {
	url: string;
	id: number;
	node_id: string;
	name: string;
	label: string;
	uploader: Author;
	content_type: string;
	state: string;
	size: number;
	digest: null;
	download_count: number;
	created_at: string;
	updated_at: string;
	browser_download_url: string;
}

interface Author {
	login: string;
	id: number;
	node_id: string;
	avatar_url: string;
	gravatar_id: string;
	url: string;
	html_url: string;
	followers_url: string;
	following_url: string;
	gists_url: string;
	starred_url: string;
	subscriptions_url: string;
	organizations_url: string;
	repos_url: string;
	events_url: string;
	received_events_url: string;
	type: string;
	user_view_type: string;
	site_admin: boolean;
}



