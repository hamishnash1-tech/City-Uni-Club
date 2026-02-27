import bcrypt from 'bcrypt'
import crypto from 'crypto'

const SALT_ROUNDS = 10

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash)
}

export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex')
}

export const generateSessionToken = (): string => {
  return crypto.randomBytes(48).toString('hex')
}
