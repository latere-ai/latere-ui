.PHONY: hooks

# hooks points git at the repository hook directory and restores the local
# CLAUDE.md -> AGENTS.md symlink, which is gitignored and so absent in a fresh
# clone.
hooks:
	git config core.hooksPath .githooks
	@[ -e CLAUDE.md ] || [ -L CLAUDE.md ] || ln -s AGENTS.md CLAUDE.md
	@echo "installed git hooks (core.hooksPath=.githooks)"
