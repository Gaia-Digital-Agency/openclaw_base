'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { portalApi } from '@/lib/portal-client'

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const passwordRef = useRef<HTMLInputElement>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const usernameRef = useRef<HTMLInputElement>(null)

  return (
    <form
      className="space-y-5"
      onSubmit={async (event) => {
        event.preventDefault()
        setError('')
        setSubmitting(true)

        const username = usernameRef.current?.value.trim() || ''
        const password = passwordRef.current?.value || ''

        try {
          const response = await fetch(portalApi('/auth/login'), {
            body: JSON.stringify({ password, username }),
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
          })

          const data = (await response.json()) as { error?: string }

          if (!response.ok) {
            setError(data.error || 'Unable to log in.')
            return
          }

          router.replace('/dashboard')
          router.refresh()
        } catch {
          setError('Unable to reach the login service.')
        } finally {
          setSubmitting(false)
        }
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          autoCapitalize="none"
          autoComplete="username"
          autoCorrect="off"
          className="border-[#d9c4a0] bg-white text-[#1d140d] placeholder:text-[#8a6b3f]"
          defaultValue="user"
          id="username"
          name="username"
          ref={usernameRef}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="flex gap-2">
          <Input
            autoComplete="current-password"
            className="border-[#d9c4a0] bg-white text-[#1d140d] placeholder:text-[#8a6b3f]"
            defaultValue="Teameditor@123"
            id="password"
            name="password"
            ref={passwordRef}
            type={showPassword ? 'text' : 'password'}
          />
          <Button
            onClick={() => setShowPassword((value) => !value)}
            type="button"
            variant="outline"
          >
            {showPassword ? 'Hide' : 'Show'}
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button className="w-full" disabled={submitting} type="submit">
        {submitting ? 'Logging in...' : 'Log in'}
      </Button>
    </form>
  )
}
