import speakeasy from 'speakeasy'

export default function confirmTwoFaCode(code: string, secret: string) {

  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token: code,
  })
}
