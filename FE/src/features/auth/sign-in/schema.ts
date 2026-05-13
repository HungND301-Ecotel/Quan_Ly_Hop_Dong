import z from 'zod';

export const SignInFormSchema = z.object({
  username: z
    .string()
    .nonempty({ message: 'Tên đăng nhập không được để trống' }),
  password: z.string().nonempty({ message: 'Mật khẩu không được để trống' }),
});

export type SignInFormValues = z.infer<typeof SignInFormSchema>;

export const SignInFormDefault: SignInFormValues = {
  username: '',
  password: '',
};
