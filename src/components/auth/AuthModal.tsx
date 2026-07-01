'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
  FieldSeparator,
} from '@/components/ui/field';
import { authClient } from '@/lib/auth-client';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onOpenChange, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!name) {
          setError('Vui lòng nhập tên của bạn');
          setLoading(false);
          return;
        }
        const { error: signUpError } = await authClient.signUp.email({
          email,
          password,
          name,
        });
        if (signUpError) {
          setError(signUpError.message || 'Lỗi đăng ký tài khoản');
        } else {
          onOpenChange(false);
          onSuccess?.();
        }
      } else {
        const { error: signInError } = await authClient.signIn.email({
          email,
          password,
        });
        if (signInError) {
          setError(signInError.message || 'Sai email hoặc mật khẩu');
        } else {
          onOpenChange(false);
          onSuccess?.();
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: window.location.origin,
      });
    } catch (err: any) {
      setError(err?.message || 'Lỗi kết nối với Google.');
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md max-w-sm rounded-lg p-6 ring-1 ring-foreground/10 bg-popover shadow-xl border">
        <AlertDialogHeader className="mb-4">
          <AlertDialogTitle className="text-xl font-heading font-semibold text-center">
            {mode === 'signin' ? 'Đăng nhập Lingua Loop' : 'Đăng ký tài khoản'}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-xs text-muted-foreground mt-1">
            {mode === 'signin'
              ? 'Trò chuyện cùng AI để cải thiện giao tiếp tiếng Anh chuyên nghiệp.'
              : 'Tạo tài khoản để lưu lại lịch sử hội thoại và từ vựng của bạn.'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <Alert
            variant="destructive"
            className="bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-md p-3 mb-4"
          >
            <AlertDescription className="font-medium text-destructive leading-normal">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup>
            {mode === 'signup' && (
              <Field>
                <FieldLabel htmlFor="name">Họ và tên</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </Field>
            )}

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </Field>
          </FieldGroup>

          <Button type="submit" className="w-full h-10 mt-6" disabled={loading}>
            {loading
              ? 'Đang xử lý...'
              : mode === 'signin'
                ? 'Đăng nhập'
                : 'Đăng ký'}
          </Button>
        </form>

        <FieldSeparator className="my-6">Hoặc tiếp tục với</FieldSeparator>

        <Button
          variant="outline"
          className="w-full h-10 flex items-center justify-center gap-2"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg className="size-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Google
        </Button>

        <div className="mt-6 text-center text-xs">
          {mode === 'signin' ? (
            <p className="text-muted-foreground">
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-primary hover:underline font-medium"
              >
                Đăng ký ngay
              </button>
            </p>
          ) : (
            <p className="text-muted-foreground">
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-primary hover:underline font-medium"
              >
                Đăng nhập ngay
              </button>
            </p>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <AlertDialogCancel variant="ghost" size="sm">
            Đóng
          </AlertDialogCancel>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
