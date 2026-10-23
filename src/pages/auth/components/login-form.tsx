import type React from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';

import FormItem from '@/components/custom/form-item';
import InputPassword from '@/components/custom/input-password';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { ROUTE_PATH } from '@/constants';
import { cn } from '@/lib/utils';
import { useAuthService } from '@/services/auth.service';
import { TLoginPayload, loginSchema } from '@/validations/auth.schema';

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const { login } = useAuthService();

  const form = useForm<TLoginPayload>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: TLoginPayload) => login(values),
  });

  const onSubmit = (values: TLoginPayload) => {
    mutate(values);
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your username below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
              <FormItem name="username" label="Username" required>
                {(field) => <Input placeholder="Type your username here" autoFocus {...field} />}
              </FormItem>
              <FormItem name="password" label="Password" required>
                {(field) => <InputPassword placeholder="Type your password here" {...field} />}
              </FormItem>

              <div className="flex justify-end">
                <Link
                  to={ROUTE_PATH.AUTH.FORGOT_PASSWORD}
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Button type="submit" className="relative w-full" disabled={isPending}>
                Login
                {isPending && <Loader2 className="animate-spin" />}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center text-sm">
            {`Don't have an account? `}
            <Link to={ROUTE_PATH.AUTH.REGISTER} className="underline underline-offset-4">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
