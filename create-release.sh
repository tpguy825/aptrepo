#!/bin/sh
set -e

do_hash() {
    HASH_NAME=$1
    HASH_CMD=$2
    echo "${HASH_NAME}:"
    for f in $(find -type f); do
        f=$(echo $f | cut -c3-) # remove ./ prefix
        if [ "$f" = "Release" ]; then
            continue
        fi
        echo " $(${HASH_CMD} ${f}  | cut -d" " -f1) $(wc -c $f)"
    done
}

# Architectures: amd64 arm64 arm7
cat << EOF
Origin: tpguy825
Label: tpguy825
Suite: stable
Codename: stable
Version: 1.0
Architectures: amd64
Components: main
Description: apt repo that auto updates from github releases - https://github.com/tpguy825/aptrepo
Date: $(date -Ru)
EOF
do_hash "MD5Sum" "md5sum"
do_hash "SHA1" "sha1sum"
do_hash "SHA256" "sha256sum"

