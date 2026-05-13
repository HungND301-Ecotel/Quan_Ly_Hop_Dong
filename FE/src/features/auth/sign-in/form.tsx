import { Form } from '@/components/form/form';
import { FormInput } from '@/components/form/form-input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  // CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FieldLabel } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import {
  SignInFormDefault,
  SignInFormSchema,
  SignInFormValues,
} from '@/features/auth/sign-in/schema';
import { useAuthContext } from '@/features/context';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

export function SignInForm() {
  const { signIn } = useAuthContext();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(SignInFormSchema),
    defaultValues: SignInFormDefault,
    mode: 'onSubmit',
  });

  return (
    <Card className='max-w-md min-w-sm shadow-lg w-full'>
      <CardHeader className='space-y-2 border-b'>
        <img
          src='/favicon.png'
          alt='logo'
          className='w-24 mx-auto rounded-full border-3 border-primary p-2'
        />
        <CardTitle className='text-center font-bold text-primary text-3xl whitespace-nowrap'>
          Đăng nhập
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form context={form} onSubmit={signIn}>
          <FormInput
            control={form.control}
            name='username'
            label='Tên đăng nhập'
            placeholder='Nhập tên đăng nhập'
            type='text'
            required
          />

          <div className='space-y-2'>
            <div className='flex justify-between'>
              <FieldLabel htmlFor='password'>
                Mật khẩu <span className='text-destructive'>*</span>
              </FieldLabel>
              <Button variant={'link'} className='h-fit font-normal' asChild>
                <Link to={'/auth/forgot-password'}>Quên mật khẩu?</Link>
              </Button>
            </div>

            <FormInput
              control={form.control}
              name='password'
              placeholder='Nhập mật khẩu'
              type='password'
              required
            />
          </div>

          <Button size={'lg'}>
            {form.formState.isSubmitting ? <Spinner /> : 'Đăng nhập'}
          </Button>
        </Form>
      </CardContent>
      {/* <CardFooter className='border-t flex items-center justify-center'>
        <span>Chưa có tài khoản?</span>
        <Button variant={'link'} className='h-fit w-fit p-0 ps-1'>
          <Link to={'/auth/sign-up'}>Đăng ký</Link>
        </Button>
      </CardFooter> */}
    </Card>
  );
}
