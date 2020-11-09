# Guidelines for maintainers

## Install Change log generator

In order to be able to generate the changelog for your published app/modules you need this [gem](https://github.com/skywinder/github-changelog-generator), which creates a log file based on **tags**, **issues** and merged **pull requests** (and splits them into separate lists according to labels) from :octocat: GitHub Issue Tracker. This requires you to install (e.g. for Windows) [Ruby](http://rubyinstaller.org/downloads/) and its [DevKit](https://github.com/oneclick/rubyinstaller/wiki/Development-Kit).

## Release

The same process applies when releasing a patch, minor or major version, i.e. the following tasks are done automatically on release:
* increase the package version number in the **package.json** file (frontend and backend API)
* publish the module on the NPM registry
* create a tag accordingly in the git repository and push it
* generates the changelog in the git repository and push it

*This requires you to have a NPM and GitHub account with the appropriate rights, if you'd like to become a maintainer please tell us*

Depending on the release type the following command will do the job (where type is either `patch`, `minor`, `major`):
```bash
npm run release:type
```

**As we have a lot of issues/PRs to be integrated in change log please [generate a GitHub token](https://github.com/github-changelog-generator/github-changelog-generator#github-token) to avoid rate-limiting on their API and set the `CHANGELOG_GITHUB_TOKEN` environment variable to your token before publishing**

*The changelog suffers from the following [issue](https://github.com/github-changelog-generator/github-changelog-generator/issues/497) so you might have to edit the generated changelog when pushing on different branches*
