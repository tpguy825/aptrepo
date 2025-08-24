#!/bin/bash
while read -u 10 p; do
	echo $p
	bun index.ts $p

	cd ../apt-repo

	dpkg-scanpackages --arch amd64 pool/ > dists/stable/main/binary-amd64/Packages
	cat dists/stable/main/binary-amd64/Packages | gzip -9 > dists/stable/main/binary-amd64/Packages.gz

	../create-release.sh > dists/stable/Release

	cat ./dists/stable/Release | gpg -u 91EDAEB6C4F3EC9F -abs > ./dists/stable/Release.gpg
	cat ./dists/stable/Release | gpg -u 91EDAEB6C4F3EC9F -abs --clearsign > ./dists/stable/InRelease

	

	git add .
	git commit -m "automated: update $p"

	cd ../fetcher
done 10< repos.txt

git push