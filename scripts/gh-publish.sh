#!/usr/bin/env bash
# Recreate the GitHub repo (public) and push all local history.
set -e

OWNER="didvc"
REPO="chatnote"

gh repo create "${OWNER}/${REPO}" --public --source=. --remote=origin --push

sleep 1.1
gh api -X PATCH "/repos/${OWNER}/${REPO}" \
  -f description="Self-hosted note-to-self chatrooms. Privacy-first by design, infinite rooms, Markdown, ephemeral/incognito room types, image uploads, tags, JSON import/export. Astro SSR + SQLite." \
  -f homepage="https://${OWNER}.github.io/${REPO}/" \
  >/dev/null

sleep 1.1
gh api -X POST "/repos/${OWNER}/${REPO}/pages" \
  -f build_type=workflow \
  >/dev/null 2>&1 || true   # 409 if Pages already exists — safe to ignore

sleep 1.1
gh api -X POST "/repos/${OWNER}/${REPO}/environments/github-pages/deployment-branch-policies" \
  -f name=main \
  >/dev/null 2>&1 || true

sleep 1.1
gh api -X PUT "/repos/${OWNER}/${REPO}/topics" \
  -f "names[]=nodejs" \
  -f "names[]=markdown" \
  -f "names[]=privacy" \
  -f "names[]=typescript" \
  -f "names[]=notes" \
  -f "names[]=sqlite" \
  -f "names[]=web-app" \
  -f "names[]=chatroom" \
  -f "names[]=self-hosted" \
  -f "names[]=astro" \
  -f "names[]=incognito" \
  -f "names[]=note-taking" \
  -f "names[]=image-upload" \
  -f "names[]=ephemeral" \
  -f "names[]=import-export" \
  -f "names[]=prisma" \
  -f "names[]=privacy-first" \
  -f "names[]=apache-2" \
  >/dev/null

sleep 1.1
gh workflow run docs.yml --repo "${OWNER}/${REPO}" --ref main

echo "Done. https://github.com/${OWNER}/${REPO}"
