import { RootPage } from '@payloadcms/next/views'
import config from '@payload-config'
import { importMap } from '../importMap.js'

export const dynamic = 'force-dynamic'

export default function AdminPage({ params, searchParams }) {
  return <RootPage config={config} importMap={importMap} params={params} searchParams={searchParams} />
}
