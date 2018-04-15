rsync -r src/ docs/
rsync build/contracts/ChainList.json docs/
git add .
git commit -m "1. adding frontend files to GitHub pages"
git push
