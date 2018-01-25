# Change Log

## [v2.0.0](https://github.com/feathers-plus/feathers-authentication-management/tree/v2.0.0) (2018-01-25)
[Full Changelog](https://github.com/feathers-plus/feathers-authentication-management/compare/v1.0.3...v2.0.0)

**Implemented enhancements:**

- migrate to feathersjs v3 [\#89](https://github.com/feathers-plus/feathers-authentication-management/pull/89) ([lwhiteley](https://github.com/lwhiteley))
- Fix reset password short reset token to work as advertised in the documentation [\#88](https://github.com/feathers-plus/feathers-authentication-management/pull/88) ([fiddler](https://github.com/fiddler))
- Fix for \#55 [\#84](https://github.com/feathers-plus/feathers-authentication-management/pull/84) ([claustres](https://github.com/claustres))

**Closed issues:**

- Purpose of resetShortToken [\#83](https://github.com/feathers-plus/feathers-authentication-management/issues/83)

## [v1.0.3](https://github.com/feathers-plus/feathers-authentication-management/tree/v1.0.3) (2017-12-30)
[Full Changelog](https://github.com/feathers-plus/feathers-authentication-management/compare/v1.0.2...v1.0.3)

**Closed issues:**

- how to pass hook data to the notifier [\#82](https://github.com/feathers-plus/feathers-authentication-management/issues/82)
- resendVerifySignup failed [\#80](https://github.com/feathers-plus/feathers-authentication-management/issues/80)
- After resetting password user not able to login [\#78](https://github.com/feathers-plus/feathers-authentication-management/issues/78)

## [v1.0.2](https://github.com/feathers-plus/feathers-authentication-management/tree/v1.0.2) (2017-11-28)
[Full Changelog](https://github.com/feathers-plus/feathers-authentication-management/compare/v1.0.1...v1.0.2)

## [v1.0.1](https://github.com/feathers-plus/feathers-authentication-management/tree/v1.0.1) (2017-11-28)
[Full Changelog](https://github.com/feathers-plus/feathers-authentication-management/compare/v1.0.0...v1.0.1)

**Implemented enhancements:**

- Remove cb from create method [\#79](https://github.com/feathers-plus/feathers-authentication-management/pull/79) ([lwhiteley](https://github.com/lwhiteley))

**Closed issues:**

- User info is not valid. \(authManagement\) [\#73](https://github.com/feathers-plus/feathers-authentication-management/issues/73)
- congratulations for v1.0!!! [\#72](https://github.com/feathers-plus/feathers-authentication-management/issues/72)

## [v1.0.0](https://github.com/feathers-plus/feathers-authentication-management/tree/v1.0.0) (2017-09-17)
[Full Changelog](https://github.com/feathers-plus/feathers-authentication-management/compare/v0.7.0...v1.0.0)

**Implemented enhancements:**

- Securely encrypts reset token before storing in the database [\#68](https://github.com/feathers-plus/feathers-authentication-management/pull/68) ([codingfriend1](https://github.com/codingfriend1))

**Closed issues:**

- Error on verification: size must be a number \>= 0 [\#70](https://github.com/feathers-plus/feathers-authentication-management/issues/70)
- Passwordless Example [\#67](https://github.com/feathers-plus/feathers-authentication-management/issues/67)
- Question:  How to use sendResetPwd when find is authenticated in users service [\#66](https://github.com/feathers-plus/feathers-authentication-management/issues/66)

**Merged pull requests:**

- Update debug to the latest version 🚀 [\#65](https://github.com/feathers-plus/feathers-authentication-management/pull/65) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))

## [v0.7.0](https://github.com/feathers-plus/feathers-authentication-management/tree/v0.7.0) (2017-08-06)
[Full Changelog](https://github.com/feathers-plus/feathers-authentication-management/compare/v0.5.0...v0.7.0)

## [v0.5.0](https://github.com/feathers-plus/feathers-authentication-management/tree/v0.5.0) (2017-08-06)
[Full Changelog](https://github.com/feathers-plus/feathers-authentication-management/compare/v0.4.2...v0.5.0)

**Implemented enhancements:**

- Make randomDigits use crypto.randomBytes [\#63](https://github.com/feathers-plus/feathers-authentication-management/pull/63) ([micaksica2](https://github.com/micaksica2))
- Allow hook.addVerification on Patch and Update hooks [\#62](https://github.com/feathers-plus/feathers-authentication-management/pull/62) ([amaurymartiny](https://github.com/amaurymartiny))
- Add skipIsVerifiedCheck option for sendResetPwd [\#61](https://github.com/feathers-plus/feathers-authentication-management/pull/61) ([marbemac](https://github.com/marbemac))
- Updated URL to docs in doc.feathersjs.com [\#57](https://github.com/feathers-plus/feathers-authentication-management/pull/57) ([eddyystop](https://github.com/eddyystop))
- fix docs [\#56](https://github.com/feathers-plus/feathers-authentication-management/pull/56) ([sylvainlap](https://github.com/sylvainlap))

**Fixed bugs:**

- removeVerification not suitable as an after find hook [\#55](https://github.com/feathers-plus/feathers-authentication-management/issues/55)

**Closed issues:**

- An in-range update of feathers-errors is breaking the build 🚨 [\#60](https://github.com/feathers-plus/feathers-authentication-management/issues/60)
- hooks.addVerification should also be possible in Before Patch and Update hooks [\#59](https://github.com/feathers-plus/feathers-authentication-management/issues/59)
- Prevent changes on PATCH [\#54](https://github.com/feathers-plus/feathers-authentication-management/issues/54)
- populateUser hook in doc [\#52](https://github.com/feathers-plus/feathers-authentication-management/issues/52)
- Im unable to ping feathers server from react native.  [\#50](https://github.com/feathers-plus/feathers-authentication-management/issues/50)
- Allow user to reset password if not yet verified [\#41](https://github.com/feathers-plus/feathers-authentication-management/issues/41)

**Merged pull requests:**

- Update sift to the latest version 🚀 [\#58](https://github.com/feathers-plus/feathers-authentication-management/pull/58) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))

## [v0.4.2](https://github.com/feathers-plus/feathers-authentication-management/tree/v0.4.2) (2017-07-01)
[Full Changelog](https://github.com/feathers-plus/feathers-authentication-management/compare/v0.4.1...v0.4.2)

## [v0.4.1](https://github.com/feathers-plus/feathers-authentication-management/tree/v0.4.1) (2017-07-01)
[Full Changelog](https://github.com/feathers-plus/feathers-authentication-management/compare/v0.4.0...v0.4.1)

**Implemented enhancements:**

- Switched to node's crypto builtin [\#51](https://github.com/feathers-plus/feathers-authentication-management/pull/51) ([eddyystop](https://github.com/eddyystop))
- removed not required crypto package from dependency [\#49](https://github.com/feathers-plus/feathers-authentication-management/pull/49) ([hardik127](https://github.com/hardik127))

**Merged pull requests:**

- Update feathers-authentication-local to the latest version 🚀 [\#48](https://github.com/feathers-plus/feathers-authentication-management/pull/48) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))

## [v0.4.0](https://github.com/feathers-plus/feathers-authentication-management/tree/v0.4.0) (2017-05-30)
[Full Changelog](https://github.com/feathers-plus/feathers-authentication-management/compare/v0.3.0...v0.4.0)

**Implemented enhancements:**

- added `sanitizeUserForClient` to options [\#47](https://github.com/feathers-plus/feathers-authentication-management/pull/47) ([markacola](https://github.com/markacola))
- Update docs for addVerification hook [\#34](https://github.com/feathers-plus/feathers-authentication-management/pull/34) ([zacaytion](https://github.com/zacaytion))
- Docs fixes [\#30](https://github.com/feathers-plus/feathers-authentication-management/pull/30) ([shawnlauzon](https://github.com/shawnlauzon))
- Edited docs to say example uses auth 1.0 [\#28](https://github.com/feathers-plus/feathers-authentication-management/pull/28) ([eddyystop](https://github.com/eddyystop))

**Closed issues:**

- option to customize `sanitizeUserForClient` function [\#46](https://github.com/feathers-plus/feathers-authentication-management/issues/46)
- Example Application [\#42](https://github.com/feathers-plus/feathers-authentication-management/issues/42)
- Does this package really need to require ECMAScript 2015? [\#29](https://github.com/feathers-plus/feathers-authentication-management/issues/29)
- checkUnique returns 'Page not found' for available value [\#14](https://github.com/feathers-plus/feathers-authentication-management/issues/14)

**Merged pull requests:**

- Update chai to the latest version 🚀 [\#45](https://github.com/feathers-plus/feathers-authentication-management/pull/45) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))
- Update sift to the latest version 🚀 [\#40](https://github.com/feathers-plus/feathers-authentication-management/pull/40) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))
- Update all dependencies to version ranges [\#38](https://github.com/feathers-plus/feathers-authentication-management/pull/38) ([daffl](https://github.com/daffl))
- Update feathers-errors to the latest version 🚀 [\#37](https://github.com/feathers-plus/feathers-authentication-management/pull/37) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))
- Update feathers-hooks to the latest version 🚀 [\#36](https://github.com/feathers-plus/feathers-authentication-management/pull/36) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))
- Update sift to the latest version 🚀 [\#35](https://github.com/feathers-plus/feathers-authentication-management/pull/35) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))
- Update sift to the latest version 🚀 [\#33](https://github.com/feathers-plus/feathers-authentication-management/pull/33) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))
- Update feathers-errors to the latest version 🚀 [\#32](https://github.com/feathers-plus/feathers-authentication-management/pull/32) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))
- Update mocha to the latest version 🚀 [\#31](https://github.com/feathers-plus/feathers-authentication-management/pull/31) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))
- Update semistandard to the latest version 🚀 [\#27](https://github.com/feathers-plus/feathers-authentication-management/pull/27) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))
- Update debug to the latest version 🚀 [\#26](https://github.com/feathers-plus/feathers-authentication-management/pull/26) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))

## [v0.3.0](https://github.com/feathers-plus/feathers-authentication-management/tree/v0.3.0) (2017-04-19)
[Full Changelog](https://github.com/feathers-plus/feathers-authentication-management/compare/v0.2.0...v0.3.0)

**Implemented enhancements:**

- Resolve `checkUnique` with `null` when no collisions [\#24](https://github.com/feathers-plus/feathers-authentication-management/pull/24) ([cpsubrian](https://github.com/cpsubrian))
- Fixes typo in docs [\#23](https://github.com/feathers-plus/feathers-authentication-management/pull/23) ([cpsubrian](https://github.com/cpsubrian))

**Closed issues:**

- getUserData never hits 'User not found' [\#25](https://github.com/feathers-plus/feathers-authentication-management/issues/25)

**Merged pull requests:**

- Update feathers-hooks to the latest version 🚀 [\#22](https://github.com/feathers-plus/feathers-authentication-management/pull/22) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))

## [v0.2.0](https://github.com/feathers-plus/feathers-authentication-management/tree/v0.2.0) (2017-04-14)
[Full Changelog](https://github.com/feathers-plus/feathers-authentication-management/compare/v0.1.6...v0.2.0)

**Implemented enhancements:**

- Add documentation to the repository for now [\#19](https://github.com/feathers-plus/feathers-authentication-management/pull/19) ([daffl](https://github.com/daffl))

**Closed issues:**

- Missing doc? [\#18](https://github.com/feathers-plus/feathers-authentication-management/issues/18)
- Question regarding 'resetPassword' [\#15](https://github.com/feathers-plus/feathers-authentication-management/issues/15)
- Errors returned are vague [\#12](https://github.com/feathers-plus/feathers-authentication-management/issues/12)

**Merged pull requests:**

- Update dependencies to enable Greenkeeper 🌴 [\#20](https://github.com/feathers-plus/feathers-authentication-management/pull/20) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))

## [v0.1.6](https://github.com/feathers-plus/feathers-authentication-management/tree/v0.1.6) (2016-12-30)
[Full Changelog](https://github.com/feathers-plus/feathers-authentication-management/compare/v0.1.5...v0.1.6)

## [v0.1.5](https://github.com/feathers-plus/feathers-authentication-management/tree/v0.1.5) (2016-12-30)
[Full Changelog](https://github.com/feathers-plus/feathers-authentication-management/compare/v0.1.4...v0.1.5)

## [v0.1.4](https://github.com/feathers-plus/feathers-authentication-management/tree/v0.1.4) (2016-12-30)
[Full Changelog](https://github.com/feathers-plus/feathers-authentication-management/compare/v0.1.3...v0.1.4)

## [v0.1.3](https://github.com/feathers-plus/feathers-authentication-management/tree/v0.1.3) (2016-12-30)
[Full Changelog](https://github.com/feathers-plus/feathers-authentication-management/compare/v0.1.2...v0.1.3)

**Implemented enhancements:**

- Safe cloning user object for further serialization [\#11](https://github.com/feathers-plus/feathers-authentication-management/pull/11) ([chrisbujok](https://github.com/chrisbujok))

**Closed issues:**

- Make app.authenticate\({ type: 'local', email, password }\) more secure [\#10](https://github.com/feathers-plus/feathers-authentication-management/issues/10)

## [v0.1.2](https://github.com/feathers-plus/feathers-authentication-management/tree/v0.1.2) (2016-12-20)
[Full Changelog](https://github.com/feathers-plus/feathers-authentication-management/compare/v0.1.1...v0.1.2)

## [v0.1.1](https://github.com/feathers-plus/feathers-authentication-management/tree/v0.1.1) (2016-12-20)
[Full Changelog](https://github.com/feathers-plus/feathers-authentication-management/compare/v0.1.0...v0.1.1)

**Implemented enhancements:**

- Update README [\#9](https://github.com/feathers-plus/feathers-authentication-management/pull/9) ([eddyystop](https://github.com/eddyystop))

## [v0.1.0](https://github.com/feathers-plus/feathers-authentication-management/tree/v0.1.0) (2016-12-18)
[Full Changelog](https://github.com/feathers-plus/feathers-authentication-management/compare/v0.0.2...v0.1.0)

**Closed issues:**

- oops, where can I find the docs? [\#7](https://github.com/feathers-plus/feathers-authentication-management/issues/7)
- update package on npm [\#6](https://github.com/feathers-plus/feathers-authentication-management/issues/6)
- Support multiple ways of communicating with user [\#1](https://github.com/feathers-plus/feathers-authentication-management/issues/1)

**Merged pull requests:**

- Removed duplicate documentation from README [\#5](https://github.com/feathers-plus/feathers-authentication-management/pull/5) ([eddyystop](https://github.com/eddyystop))

## [v0.0.2](https://github.com/feathers-plus/feathers-authentication-management/tree/v0.0.2) (2016-11-21)
[Full Changelog](https://github.com/feathers-plus/feathers-authentication-management/compare/v0.0.1...v0.0.2)

## [v0.0.1](https://github.com/feathers-plus/feathers-authentication-management/tree/v0.0.1) (2016-11-21)


\* *This Change Log was automatically generated by [github_changelog_generator](https://github.com/skywinder/Github-Changelog-Generator)*