import { mkdirSync } from 'node:fs'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'

const requireUser = ({ req }) => Boolean(req.user)
const payloadSecret = process.env.PAYLOAD_SECRET
const cmsDatabaseUrl = process.env.CMS_TURSO_DATABASE_URL ||
  (process.env.NODE_ENV === 'development' ? 'file:./.data/cms.db' : '')

if (cmsDatabaseUrl.startsWith('file:')) mkdirSync('.data', { recursive: true })

if (process.env.NODE_ENV === 'production' && !payloadSecret) {
  throw new Error('PAYLOAD_SECRET must be set in the production environment.')
}

const config = buildConfig({
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
          const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true })
          return totalDocs === 0
        },
        read: async ({ req }) => {
          if (req.user) return true
          const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true })
          return totalDocs === 0
        },
        update: requireUser,
        delete: requireUser
      },
      fields: []
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
    client: {
      url: cmsDatabaseUrl,
      authToken: process.env.CMS_TURSO_AUTH_TOKEN
    },
    migrationDir: './payload-migrations'
  }),
  editor: lexicalEditor(),
  secret: payloadSecret || '',
  routes: {
    admin: '/admin',
    api: '/api/cms'
  }
})

export default config
