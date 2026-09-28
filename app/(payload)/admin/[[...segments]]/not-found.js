import { NotFoundPage } from '@payloadcms/next/views'
import config from '@payload-config'
import { importMap } from '../importMap.js'

export default function AdminNotFound({ params, searchParams }) {
  return <NotFoundPage config={config} importMap={importMap} params={params} searchParams={searchParams} />
}
