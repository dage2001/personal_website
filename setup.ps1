Set-Location E:\personal_web

docker run --rm `
  -v "E:\personal_web:/site" `
  -w /site `
  ruby:3.2-bookworm `
  bash -lc "bundle install >/tmp/bundle.log && JEKYLL_ENV=production bundle exec jekyll build"

Set-Location E:\personal_web\_site

git -c safe.directory=E:/personal_web/_site status --short
git -c safe.directory=E:/personal_web/_site add -A
git -c safe.directory=E:/personal_web/_site commit -m "Update website"
git -c safe.directory=E:/personal_web/_site push