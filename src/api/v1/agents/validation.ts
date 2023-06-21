import { mixed, object, string } from 'yup';

export const agentSchema = object({
  name: string().required(),
  description: string().nullable(),
  instagram: string().nullable(),
  twitter: string().nullable(),
  email: string().email().nullable(),
  logo: mixed().nullable(),
});
