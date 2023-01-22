/* eslint-disable import/prefer-default-export */
import * as yup from 'yup';

export const phoneSchema = yup
  .number()
  .typeError('يجب أن يكون الهاتف رقمًا')
  .required('الهاتف هو حقل مطلوب')
  .test('len', 'يجب أن يكون 8 أرقام', (val) => val?.toString().length === 8);

export const passwordSchema = yup
  .string()
  .required('كلمة المرور هي حقل مطلوب')
  .min(3, 'يجب أن تتكون كلمة المرور من 3 أحرف على الأقل');
