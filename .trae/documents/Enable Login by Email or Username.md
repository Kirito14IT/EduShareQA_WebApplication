I have identified the issue. The user registered with:

* **Username**: `wzh`

* **Email**: `3657751462@qq.com`

However, the user is trying to login using their **Email** (`3657751462@qq.com`) in the login form, but the current backend implementation strictly expects a **Username**.

The `UserDetailsServiceImpl.java` only calls `userMapper.selectByUsername(username)`. When the user enters their email, the system looks for a user with *username* "<3657751462@qq.com>", finds nothing, and fails.

To fix this and improve user experience (allowing login by either Username or Email), I will:

1. **Modify** **`UserMapper.java`**: Add a method `selectByUsernameOrEmail` to find a user by either field.
2. **Update** **`UserDetailsServiceImpl.java`**: Change `loadUserByUsername` to use the new mapper method. This will allow Spring Security to authenticate users whether they provide a username or an email.
3. **Update** **`AuthService.java`**: Update the `login` method to also support looking up the user by username OR email when generating the JWT token (since it also fetches the user after authentication).
4. **Verify**: I will verify the fix by running a test script that attempts to login using the email address.

