# Contributing

Start with the [README](README.md) for what this repository is and how to
build and test it. Every bug fix ships with a test that fails without it,
and every change is one small commit with a message that says why.

## Writing

Every sentence latere-ui emits or carries is written for one reader, and the
register follows the reader:

- User, a person or a coding harness: component copy and default labels, the
  README and the docs. Short and plain: what happened and what to do next,
  naming a command or a page, never a package, a function, a table, or a
  Kubernetes object.
- Contributor, someone changing latere-ui: specs, this file, package
  documentation, commit messages, source comments. Precise, in the project's
  own terms, with the reason a design is what it is.
- Developer, someone debugging a running system: console warnings a
  component emits and test failure output. Exact and complete: object,
  operation, observed value, expected value, and the underlying error.

An error has one code, one fixed user sentence in `message`, and one
developer detail in a separate field shown only on request. The canonical
statement, worked examples, and the review checklist are in the registers
document in pkg:
https://github.com/latere-ai/pkg/blob/main/docs/writing/registers.md
The rule applies to new text and to reviews; existing text is fixed as it is
touched.
