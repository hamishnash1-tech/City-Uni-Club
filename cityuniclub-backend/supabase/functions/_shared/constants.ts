export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export const SITE_URL = 'https://www.cityuniversityclub.co.uk'
export const CLUB_NAME = 'City University Club'
export const CLUB_ADDRESS = '42 Crutched Friars, London EC3N 2AP'
export const CLUB_EMAIL = 'secretary@cityuniversityclub.co.uk'
export const CLUB_LOI_EMAIL = 'loi@admin.cityuniversityclub.co.uk'
export const CLUB_PHONE = '0207 167 6682'
export const FROM_EMAIL = `${CLUB_NAME} <no-reply@admin.cityuniversityclub.co.uk>`
