import * as bcrypt from 'bcrypt';

export function encryptPassword(pass: string) {
  const saltRounds = 10;
  const hashedPassword = bcrypt.hashSync(pass, saltRounds);
  return hashedPassword;
}
