import { mixed, object, string } from 'yup';

export const agentSchema = object({
  name: string().required(),
  description: string(),
  instagram: string(),
  twitter: string(),
  facebook: string(),
  email: string().email(),
  logo: mixed(),
});
