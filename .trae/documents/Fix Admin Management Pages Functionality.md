The user reported that the "Save" button in `TeacherManagementPage.tsx` (admin - create/edit teacher) does nothing.

After analyzing `TeacherManagementPage.tsx`, I found the following issue:
- The form submit handler `handleSubmit` is defined:
  ```typescript
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (editingTeacher) {
      updateMutation.mutate({ id: editingTeacher.id, payload: form })
    } else {
      createMutation.mutate(form)
    }
  }
  ```
- The save button is inside the form:
  ```typescript
  <motion.button
    type="submit" // Correct type
    className="primary-button"
    disabled={createMutation.isPending || updateMutation.isPending}
    // ...
  >
    {createMutation.isPending || updateMutation.isPending ? '保存中…' : '保存'}
  </motion.button>
  ```
- However, the `form` element tag is:
  ```typescript
  <form onSubmit={handleSubmit} className="form-grid">
  ```
  It looks correct at first glance.

**Wait**, I noticed in the `ResourceUploadPage.tsx` (from previous task) and `TeacherManagementPage.tsx`, the `motion.button` is used.
If the button is inside the form and has `type="submit"`, it should trigger the form submission.

Let's look closely at `TeacherManagementPage.tsx` lines 375-382:
```typescript
<motion.button
  type="submit"
  className="primary-button"
  disabled={createMutation.isPending || updateMutation.isPending}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  {createMutation.isPending || updateMutation.isPending ? '保存中…' : '保存'}
</motion.button>
```

However, in `TeacherManagementPage.tsx`, the form inputs for `createTeacher` are:
`username`, `email`, `fullName` are required. `password` is NOT in the form state `form`.
When creating a teacher, the backend likely expects a password, or generates a default one.
Looking at `TeacherCreate` type definition (I haven't seen it but I can infer):
If the backend `api.createTeacher` payload requires a `password` field and it's missing or empty string, validation might fail silently if not handled, or the button might be doing nothing because of some other reason.

**Wait**, `TeacherCreate` usually requires a password for a new user.
Let's check `api.ts` or `types/api.ts` to see what `TeacherCreate` expects.
Wait, I don't need to read `types/api.ts`, I can look at `TeacherManagementPage.tsx` state:
```typescript
const [form, setForm] = useState<TeacherCreate>({
    username: '',
    email: '',
    fullName: '',
    department: '',
    title: '',
    bio: '',
    courseIds: [],
})
```
There is no `password` field in the initial state!
If the backend requires a password for registration/creation (which it almost certainly does for a new user), and the frontend isn't sending one, the request might be failing or the mutation isn't even firing if validation fails (though HTML validation only checks `required` fields present in DOM).

**Actually**, `resetForm` also doesn't reset a password field.
The form UI doesn't have a password input!
```typescript
<label>
  用户名 <span className="required">*</span>
  <input ... required />
</label>
...
```
It has Username, Email, FullName. No Password input.

**Hypothesis**: The backend `createTeacher` endpoint requires a password. If the frontend doesn't provide it, the request fails. Or maybe the backend generates a default one?
If the backend requires it, the frontend MUST send it.
I should add a `password` field to the form (maybe with a default value or user input).
Also, for `editingTeacher`, we probably don't want to update password here (usually separate flow), so it should be optional.

**Also**, checking `AdminCourseController` and `CourseManagementPage`...
`CourseManagementPage` looks similar.
`ResourceManagementPage` uses `api.getAllResources` but the mock data or backend implementation might need verification.

**Wait, the user said "clicking save has no response".**
If `type="submit"` is set, clicking it *will* submit the form.
If "no response" means no network request is sent, then `e.preventDefault()` is working but `mutate` isn't called? Unlikely unless logic prevents it.
If "no response" means the request fails silently or with a generic error, then it's a backend/payload mismatch.
Or maybe the button is disabled?

**Let's look at `CourseManagementPage.tsx`**:
Similar structure.
I need to check `types/api.ts` to see what `TeacherCreate` and `CourseCreate` actually require.

**Another issue in `ResourceManagementPage`**:
It displays `用户{resource.uploaderId}` and `课程{resource.courseId}`.
Just like the previous task, this should be real names.
I should fetch `courses` and `teachers`/`users` to map IDs to names, or rely on the backend to return names (which `ResourceDetail` does, but `Resource` in list might not? Let's check `PagedResourceList` item type).
In `ResourceListPage`, we saw `getUploaderName` mock function. `ResourceManagementPage` has similar "用户ID" display.

**Plan**:
1.  **Fix `TeacherManagementPage`**:
    *   Add `password` field to `TeacherCreate` form (required for creation, optional/hidden for edit).
    *   Ensure `handleSubmit` calls the mutation.
2.  **Fix `CourseManagementPage`**:
    *   It seems fine logic-wise, but I should ensure `teacherIds` handling is correct (it's currently not exposed in the UI form! The form has `code`, `name`, `faculty`, `description` inputs, but NO way to select teachers!).
    *   I need to add a "Assign Teachers" section in the Course modal or use the `teacherIds` field.
3.  **Fix `ResourceManagementPage` & `QuestionManagementPage`**:
    *   Fetch `courses` and `users` to display real names instead of IDs.
    *   Or update backend DTOs to include names (but I cannot change backend easily without full recompile/restart, frontend fix is safer for now).
    *   Actually, for Admin pages, fetching all courses/users might be heavy but for a management page it's acceptable or we can use the `getProfile` or similar if available.
    *   Better: Use `api.getCourses` and `api.getTeachers` to populate lookup maps.

**Refined Plan**:
1.  **TeacherManagementPage**: Add "Password" input for new teachers (default to '123456' or let user type).
2.  **CourseManagementPage**: Add a multi-select for Teachers in the Create/Edit Course modal.
3.  **Resource/Question Management**: Enhance the list to show Course Names and User Names by fetching necessary data.

I will start by reading `types/api.ts` to confirm the DTO structures.
Then implement the fixes.

**One more thing**: The user said "Clicking save has no response".
If the `TeacherCreate` type definition in frontend requires `password` but the state `form` doesn't have it, TypeScript might complain during compile, or if it's `any` casted it might fail at runtime.
Let's verify `types/api.ts`.
