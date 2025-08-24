# tpguy825's apt repository

Personal apt repo for some software that distributes .deb files on Github Releases, but don't have their own repo, making updating harder

All packages are updated with a cron job twice daily

## How to use

```bash
wget -O- https://keys.openpgp.org/vks/v1/by-fingerprint/CEEA496A2C5AB71E34ACD48691EDAEB6C4F3EC9F | gpg --dearmor | sudo tee /usr/share/keyrings/tpguy825-apt-repo.gpg >/dev/null
wget -O- https://apt.tpgy.uk/repo.sources | sudo tee /etc/apt/sources.list.d/tpguy825-apt-repo.sources >/dev/null
sudo apt update
```

> Note: If apt.tpgy.uk doesn't work, use tpguy825.github.io/aptrepo instead
