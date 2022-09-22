---
title: Best Practices
---

# Best Practices

## Security

- The user must be authenticated when the short token is used, making the short token less appealing
  as an attack vector.
- The long and short tokens are erased on successful verification and password reset attempts.
  New tokens must be acquired for another attempt.
- API parameters are verified to be strings. If the parameter is an object, the values of its props are
  verified to be strings.
- `options.identifyUserProps` restricts the property names allowed in param objects.
- In order to protect sensitive data, you should set a hook that prevent `PATCH` or `PUT` calls on
  authentication-management related properties:

```javascript
// users.hooks.js
before: {
  update: [
    disallow("external")
  ],
  patch: [
    iff(isProvider('external'), preventChanges(
      true,
      'isVerified',
      'resetExpires'
      'resetShortToken',
      'resetToken',
      'verifyChanges',
      'verifyExpires',
      'verifyShortToken',
      'verifyToken',
    )),
  ],
},
```
