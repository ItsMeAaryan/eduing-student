import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/about', '/programs', '/universities'],
      disallow: ['/student/', '/admin/', '/auth/'],
    },
    // TODO: confirm actual production domain
    sitemap: 'https://student.eduing.in/sitemap.xml',
  }
}
