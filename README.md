# tpguy825's apt repository

Personal apt repo for some software that distributes .deb files on Github Releases, but don't have their own repo, making updating harder

All packages are updated with a [github action](https://github.com/tpguy825/aptrepo/blob/main/.github/workflows/main.yml) daily

## How to use

```bash
wget -O- https://keys.openpgp.org/vks/v1/by-fingerprint/CEEA496A2C5AB71E34ACD48691EDAEB6C4F3EC9F | gpg --dearmor | sudo tee /usr/share/keyrings/tpguy825-apt-repo.gpg >/dev/null
wget -O- https://apt.tpgy.uk/repo.sources | sudo tee /etc/apt/sources.list.d/tpguy825-apt-repo.sources >/dev/null
sudo apt update
```

> Note: If apt.tpgy.uk doesn't work, use https://raw.githubusercontent.com/tpguy825/aptrepo/refs/heads/main/apt-repo/ instead

## Packages

Currently in this repo are:
- [fzf](https://github.com/junegunn/fzf)
- [bat](https://github.com/sharkdp/bat)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp)
- [cloudflared](https://github.com/cloudflare/cloudflared)
- [zoxide](https://github.com/ajeetdsouza/zoxide)
- [git-credential-manager (gcm)](https://github.com/git-ecosystem/git-credential-manager)
- [fastfetch](https://github.com/fastfetch-cli/fastfetch)
- [rpi-imager](https://github.com/raspberrypi/rpi-imager)

[view on github](https://github.com/tpguy825/aptrepo)
