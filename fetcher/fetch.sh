#!/bin/bash
while read -u 10 p; do
	echo $p
	bun index.ts $p

	cd ../apt-repo

	dpkg-scanpackages --arch amd64 pool/ > dists/stable/main/binary-amd64/Packages
	cat dists/stable/main/binary-amd64/Packages | gzip -9 > dists/stable/main/binary-amd64/Packages.gz

	../create-release.sh > dists/stable/Release

	git add .
	git commit -m "automated: update $p"
	git push

	cd ../fetcher
done 10< repos.txt