import { mkdirSync } from 'node:fs'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { buildConfig } from 'payload'

const requireUser = ({ req }) => Boolean(req.user)
const payloadSecret = process.env.PAYLOAD_SECRET
const cmsDatabaseUrl = process.env.CMS_TURSO_DATABASE_URL ||
  (process.env.NODE_ENV === 'development' ? 'file:./.data/cms.db' : '')

if (cmsDatabaseUrl.startsWith('file:')) mkdirSync('.data', { recursive: true })

if (process.env.NODE_ENV === 'production' && !payloadSecret) {
  throw new Error('PAYLOAD_SECRET must be set in the production environment.')
}

// Media lives in a Cloudflare R2 bucket (S3-compatible). Without the keys, uploads fall back to local disk.
const r2Enabled = Boolean(
  process.env.CDF_S3_ENDPOINT && process.env.CDF_R2_BUCKET &&
  process.env.CDF_KEY_ACESS_ID && process.env.CDF_SECRET_KEY_ACESS
)
// Optional public bucket domain (for example https://media.deynstudio.com). Without it,
// images are served through the CMS at /api/cms/media/file/<name>.
const r2PublicUrl = process.env.CDF_R2_PUBLIC_URL?.replace(/\/+$/, '')

const config = buildConfig({
  typescript: {
    postProcess: [({ compiledTypes }) => compiledTypes.replace(/(\* DO NOT MODIFY IT BY HAND\.[\s\S]*?\*\/\n)/, "$1import type {} from 'payload'\n")]
  },
  admin: {
    user: 'users'
  },
  collections: [
    {
      slug: 'users',
      auth: true,
      admin: { useAsTitle: 'email' },
      access: {
        create: async ({ req }) => {
          if (req.user) return true
          // First-user signup stays closed in production unless it is deliberately opened for setup.
          if (process.env.NODE_ENV === 'production' && process.env.CMS_ALLOW_FIRST_USER !== 'true') return false
          const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true })
          return totalDocs === 0
        },
        read: async ({ req }) => {
          if (req.user) return true
          const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true })
          return totalDocs === 0
        },
        update: requireUser,
        // Nobody can delete their own account, so the CMS cannot lock itself out.
        delete: ({ req, id }) => Boolean(req.user) && String(req.user.id) !== String(id)
      },
      fields: []
    },
    {
      slug: 'media',
      access: {
        read: () => true,
        create: requireUser,
        update: requireUser,
        delete: requireUser
      },
      admin: { group: 'Content' },
      upload: {
        staticDir: '.data/media',
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
      },
      fields: [
        {
          name: 'alt',
          label: 'Description',
          type: 'text',
          required: true,
          admin: { description: 'Describe the image for screen readers and search engines.' }
        }
      ]
    },
    {
      slug: 'posts',
      admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'slug', 'publishedAt', 'updatedAt'],
        group: 'Content'
      },
      access: {
        read: ({ req }) => req.user ? true : { _status: { equals: 'published' } },
        create: requireUser,
        update: requireUser,
        delete: requireUser
      },
      versions: { drafts: true },
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
          index: true,
          admin: { position: 'sidebar' }
        },
        { name: 'excerpt', type: 'textarea', required: true },
        {
          name: 'coverImage',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Optional. Takes priority over the cover image URL below.' }
        },
        {
          name: 'coverImageUrl',
          label: 'Cover image URL',
          type: 'text',
          validate: (value) => {
            if (!value) return true
            try {
              return new URL(value).protocol === 'https:' || 'Use an HTTPS image URL.'
            } catch {
              return 'Enter a valid HTTPS image URL.'
            }
          },
          admin: { description: 'Optional HTTPS image URL.' }
        },
        {
          name: 'coverImageAlt',
          label: 'Cover image description',
          type: 'text',
          admin: { description: 'Describe the image for screen readers and search previews.' }
        },
        {
          name: 'publishedAt',
          type: 'date',
          required: true,
          defaultValue: () => new Date().toISOString(),
          admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } }
        },
        {
          name: 'content',
          type: 'richText',
          required: true,
          editor: lexicalEditor()
        }
      ]
    }
  ],
  db: sqliteAdapter({
    // The CMS database is remote; schema changes only ever arrive through payload-migrations.
    push: false,
    client: {
      url: cmsDatabaseUrl,
      authToken: process.env.CMS_TURSO_AUTH_TOKEN
    },
    migrationDir: './payload-migrations'
  }),
  editor: lexicalEditor(),
  plugins: [
    s3Storage({
      enabled: r2Enabled,
      bucket: process.env.CDF_R2_BUCKET || '',
      collections: {
        media: r2PublicUrl
          ? { generateFileURL: ({ filename, prefix }) => [r2PublicUrl, prefix, filename].filter(Boolean).join('/') }
          : true
      },
      config: {
        endpoint: process.env.CDF_S3_ENDPOINT,
        region: 'auto',
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.CDF_KEY_ACESS_ID || '',
          secretAccessKey: process.env.CDF_SECRET_KEY_ACESS || ''
        }
      }
    })
  ],
  secret: payloadSecret || '',
  routes: {
    admin: '/admin',
    api: '/api/cms'
  }
})

export default config
