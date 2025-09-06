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

interface RepoConfig {
	repo: `${string}/${string}`;
	/** @returns file name of saved deb file or false to skip */
	eachFile?: EachFile;
	fileNameEnding?: undefined | null | `.${string}`;
	fileNamePrefix?: undefined | null | string;
	skipchecks?: boolean;
}
type MaybePromise<T> = T | Promise<T>;

type EachFile = (name: string, contents: () => Promise<Buffer>, release: Release) => MaybePromise<string | false>;

