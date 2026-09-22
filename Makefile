.PHONY: hooks

# hooks points git at the repository hook directory.
hooks:
	git config core.hooksPath .githooks
	@echo "installed git hooks (core.hooksPath=.githooks)"
