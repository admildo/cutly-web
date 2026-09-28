import '@payloadcms/next/css'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import config from '@payload-config'
import { importMap } from './admin/importMap.js'

export const metadata = { title: 'Cutly CMS', robots: { index: false, follow: false } }

const serverFunction = async (args) => {
  'use server'
  return handleServerFunctions({ ...args, config, importMap })
}

export default function PayloadLayout({ children }) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  )
}
