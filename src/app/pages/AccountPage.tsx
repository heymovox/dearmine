import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { deleteAccountSchema, passwordSchema, updateProfileSchema } from '../../shared'
import { api } from '../../api/client'
import { errorMessage, useAuth } from '../../api/AuthContext'
import {
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  StatusMessage,
  useDocumentTitle,
  useToast,
} from '../ui'

const changePasswordForm = z.object({
  currentPassword: z.string().min(1, 'Enter your current password'),
  newPassword: passwordSchema,
})

type ProfileValues = z.infer<typeof updateProfileSchema>
type PasswordValues = z.infer<typeof changePasswordForm>
type DeleteValues = z.infer<typeof deleteAccountSchema>

export default function AccountPage() {
  useDocumentTitle('Account')
  const { user, refresh, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [profileError, setProfileError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user?.name ?? '' },
  })
  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(changePasswordForm),
    defaultValues: { currentPassword: '', newPassword: '' },
  })
  const deleteForm = useForm<DeleteValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: { password: '' },
  })

  const saveProfile = profileForm.handleSubmit(async (values) => {
    setProfileError(null)
    try {
      await api.patch('/auth/profile', values)
      await refresh()
      toast.push('Profile updated', 'success')
    } catch (err) {
      setProfileError(errorMessage(err, 'We could not update your profile'))
    }
  })

  const changePassword = passwordForm.handleSubmit(async (values) => {
    setPasswordError(null)
    try {
      await api.post('/auth/change-password', values)
      toast.push('Password changed — please sign in again', 'success')
      await logout()
      navigate('/login', { replace: true })
    } catch (err) {
      setPasswordError(errorMessage(err, 'We could not change your password'))
    }
  })

  const deleteAccount = deleteForm.handleSubmit(async (values) => {
    setDeleteError(null)
    if (!window.confirm('Delete your account permanently? Published surprises will stop working.')) return
    try {
      await api.del('/auth/account', { password: values.password })
      await logout()
      navigate('/', { replace: true })
    } catch (err) {
      setDeleteError(errorMessage(err, 'We could not delete your account'))
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Account" description="Your details, password and account settings." />

      <Card>
        <h2 className="font-display text-xl text-ink">Profile</h2>
        <p className="mt-1 text-sm text-ink/60">Signed in as {user?.email}</p>
        <form className="mt-4 flex flex-col gap-4" onSubmit={saveProfile} noValidate>
          {profileError && <StatusMessage tone="error">{profileError}</StatusMessage>}
          <Field label="Display name" error={profileForm.formState.errors.name?.message} required>
            <Input {...profileForm.register('name')} />
          </Field>
          <div>
            <Button type="submit" loading={profileForm.formState.isSubmitting}>
              Save changes
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="font-display text-xl text-ink">Change password</h2>
        <p className="mt-1 text-sm text-ink/60">You will be signed out of all devices afterwards.</p>
        <form className="mt-4 flex flex-col gap-4" onSubmit={changePassword} noValidate>
          {passwordError && <StatusMessage tone="error">{passwordError}</StatusMessage>}
          <Field label="Current password" error={passwordForm.formState.errors.currentPassword?.message} required>
            <Input type="password" autoComplete="current-password" {...passwordForm.register('currentPassword')} />
          </Field>
          <Field
            label="New password"
            hint="At least 8 characters"
            error={passwordForm.formState.errors.newPassword?.message}
            required
          >
            <Input type="password" autoComplete="new-password" {...passwordForm.register('newPassword')} />
          </Field>
          <div>
            <Button type="submit" variant="secondary" loading={passwordForm.formState.isSubmitting}>
              Update password
            </Button>
          </div>
        </form>
      </Card>

      <Card className="border-red-200">
        <h2 className="font-display text-xl text-red-700">Delete account</h2>
        <p className="mt-1 text-sm text-ink/60">
          This anonymises your account and takes your published surprises offline. This cannot be undone.
        </p>
        <form className="mt-4 flex flex-col gap-4" onSubmit={deleteAccount} noValidate>
          {deleteError && <StatusMessage tone="error">{deleteError}</StatusMessage>}
          <Field label="Confirm with your password" error={deleteForm.formState.errors.password?.message} required>
            <Input type="password" autoComplete="current-password" {...deleteForm.register('password')} />
          </Field>
          <div>
            <Button type="submit" variant="danger" loading={deleteForm.formState.isSubmitting}>
              Delete my account
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
