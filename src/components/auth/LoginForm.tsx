// src/components/auth/LoginForm.tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabse'
import { useAuthStore } from '../../store/authStore'
import type { User } from '../../types'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

type LoginFormData = {
  email: string
  password: string
}

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const navigate = useNavigate()
  const setUserSession = useAuthStore((state) => state.setUserSession)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    defaultValues: { email: '', password: '' }
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })

    if (loginError) {
      console.log('❌ loginError:', loginError)
      setError(loginError.message)
    } else if (loginData.user && loginData.session) {
      // Map Supabase's User → your app's User type
      const supaUser = loginData.user
      const appUser: User = {
        id:        supaUser.id,
        name:      (supaUser.user_metadata as any)?.name    ?? '',
        email:     supaUser.email                          ?? '',
        role:      (supaUser.user_metadata as any)?.role    ?? 'authenticated',
        createdAt: supaUser.created_at                     ?? new Date().toISOString()
      }

      // Update your global store and redirect
      setUserSession(appUser, loginData.session)
      navigate('/dashboard')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center">
            <img src="/media/ramay-clinic.jpg" alt="Logo" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Ramay Clinic
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access the medical inventory management system
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Email address"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
            />

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                autoComplete="current-password"
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
              />
              <button
                type="button"
                className="absolute right-3 top-[34px] text-gray-500 text-sm"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 py-2 px-3 rounded">
              {error}
            </div>
          )}

          <div>
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign in
            </Button>
            <Link to="/signup">
              <Button type="button" className="w-full mt-5">
                Sign Up
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}