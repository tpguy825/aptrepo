import { existsSync } from "fs";
import fs from "fs/promises";
import path from "path";

type MaybePromise<T> = T | Promise<T>;

type EachFile = (name: string, contents: () => Promise<Buffer>, release: Release) => MaybePromise<string | false>;

export const defaultEachFile = async (name: string, contents: () => Promise<Buffer>) => {
	const filepath = path.join(poolpath, name);
	const filepath2 = path.join(poolpath, firstchar(name), name.split("_")[0]!.trim(), name);

	if (existsSync(filepath) || existsSync(filepath2)) return false;
	await fs.writeFile(filepath, await contents());
	return filepath;
};

export interface RepoConfig {
	repo: `${string}/${string}`;
	/** @returns file name of saved deb file or false to skip */
	eachFile?: EachFile;
	fileNameEnding?: `.${string}`;
}

export function firstchar(t: string) {
	return t.slice(0, 1);
}
/** remove amount chars from end of t */
export function truncate(t: string, amount: number) {
	return t.slice(0, t.length - amount);
}
export const poolpath = path.join(__dirname, "..", "apt-repo/pool/main");

async function getLatest(repo: RepoConfig) {
	console.log(repo.repo);

	const latest = await fetch(`https://api.github.com/repos/${repo.repo}/releases`, {
		headers: { "User-Agent": "fetcher/1.0 (https://github.com/tpguy825/aptrepo)" },
	}).then((r) => r.json() as Promise<Release[]>);
	if (!latest[0]) return console.error(latest);

	for (const file of latest[0].assets) {
		if (
			!file.name.endsWith(repo.fileNameEnding ?? ".deb") ||
			!file.name.includes("linux") ||
			!(
				file.name.includes("amd64") ||
				file.name.includes("arm64") ||
				file.name.includes("armhf") ||
				file.name.includes("armv7")
			) ||
			file.name.includes("musl-linux")
		)
			continue;

		const eachFile = repo.eachFile ?? defaultEachFile;
		const filepath = await eachFile(file.name, () =>
			fetch(file.browser_download_url, {
				headers: { "User-Agent": "fetcher/1.0 (https://github.com/tpguy825/aptrepo)" },
				cache: "no-cache",
			})
				.then((r) => r.arrayBuffer())
				.then((r) => Buffer.from(r)),
			latest[0]
		);
		if (!filepath) continue;
		await Bun.$`reprepro -b ../apt-repo -S utils -P optional includedeb stable ${filepath}`;
		await fs.unlink(filepath);
	}
}

for (const repo of await fs.readdir("repos")) {
	try {
		await (import(path.join(__dirname, "repos", repo)) as Promise<{ default: RepoConfig }>).then((r) =>
			getLatest(r.default),
		);
	} catch (e) {
		console.error(e);
	}
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


