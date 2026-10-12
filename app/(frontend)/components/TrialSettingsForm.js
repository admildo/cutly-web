'use client'

import { useState } from 'react'

const allowanceFields = [
  { key: 'clipGenerationsMax', label: 'AI clip generations', help: 'Initial clip generation and reprompts share this allowance.' },
  { key: 'smartCleanMax', label: 'Smart audio cleaning', help: 'Each AI word-matching action uses one allowance.' },
  { key: 'captionTranslationsMax', label: 'Caption translations', help: 'Each translation action uses one allowance.' },
  { key: 'mediaAssistantPlansMax', label: 'Media Assistant plans', help: 'Each new plan or AI-assisted revision uses one allowance.' }
]

export function TrialSettingsForm({ initialConfig }) {
  const [values, setValues] = useState({
    enabled: initialConfig.enabled,
    clipGenerationsMax: initialConfig.clipGenerationsMax,
    smartCleanMax: initialConfig.smartCleanMax,
    captionTranslationsMax: initialConfig.captionTranslationsMax,
    mediaAssistantPlansMax: initialConfig.mediaAssistantPlansMax,
    dailyBudgetDollars: (initialConfig.dailyBudgetMicros / 1_000_000).toFixed(2),
    monthlyBudgetDollars: (initialConfig.monthlyBudgetMicros / 1_000_000).toFixed(2)
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }))

  const save = async (event) => {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const response = await fetch('/api/admin/trial-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          clipGenerationsMax: Number(values.clipGenerationsMax),
          smartCleanMax: Number(values.smartCleanMax),
          captionTranslationsMax: Number(values.captionTranslationsMax),
          mediaAssistantPlansMax: Number(values.mediaAssistantPlansMax),
          dailyBudgetDollars: Number(values.dailyBudgetDollars),
          monthlyBudgetDollars: Number(values.monthlyBudgetDollars)
        })
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Could not save trial settings.')
      setValues({
        enabled: result.enabled,
        clipGenerationsMax: result.clipGenerationsMax,
        smartCleanMax: result.smartCleanMax,
        captionTranslationsMax: result.captionTranslationsMax,
        mediaAssistantPlansMax: result.mediaAssistantPlansMax,
        dailyBudgetDollars: (result.dailyBudgetMicros / 1_000_000).toFixed(2),
        monthlyBudgetDollars: (result.monthlyBudgetMicros / 1_000_000).toFixed(2)
      })
      setMessage('Trial settings are live.')
    } catch (saveError) {
      setError(saveError.message || 'Could not save trial settings. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} className="mt-6 overflow-hidden rounded-[24px] bg-[#151619] shadow-[0_18px_54px_rgb(0_0_0/.2)]">
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-7 sm:py-6">
        <div>
          <h2 className="m-0 text-lg font-medium tracking-[-0.02em]">Trial availability</h2>
          <p className="mb-0 mt-1 text-sm text-[#a6a4a4]">Pause every sponsored AI action at once.</p>
        </div>
        <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-full bg-[#202125] px-4 text-sm font-medium text-[#f2f2ee] shadow-[0_4px_14px_rgb(0_0_0/.16)] focus-within:shadow-[0_0_0_2px_rgb(242_242_238/.4)]">
          <input
            type="checkbox"
            checked={values.enabled}
            onChange={(event) => update('enabled', event.target.checked)}
            className="h-4 w-4 accent-[#f2f2ee]"
          />
          Trial is on
        </label>
      </div>

      <div className="divide-y divide-white/[.07] px-5 sm:px-7">
        {allowanceFields.map(({ key, label, help }) => (
          <label key={key} className="grid gap-3 py-5 sm:grid-cols-[1fr_112px] sm:items-center">
            <span>
              <span className="block text-sm font-medium text-[#f2f0ef]">{label}</span>
              <span className="mt-1 block max-w-xl text-xs leading-5 text-[#a6a4a4]">{help}</span>
            </span>
            <span className="flex items-center gap-3 text-sm text-[#a6a4a4] sm:justify-end">
              <input
                aria-label={`${label} per account`}
                type="number"
                inputMode="numeric"
                min="0"
                max="20"
                step="1"
                required
                value={values[key]}
                onChange={(event) => update(key, event.target.value)}
                className="min-h-11 w-20 rounded-xl bg-[#0d0e11] px-3 text-center text-sm text-[#f2f2ee] shadow-[inset_0_2px_5px_rgb(0_0_0/.35)] outline-none focus-visible:shadow-[0_0_0_2px_rgb(242_242_238/.5),inset_0_2px_5px_rgb(0_0_0/.25)]"
              />
              per account
            </span>
          </label>
        ))}

        <label className="grid gap-3 py-5 sm:grid-cols-[1fr_160px] sm:items-center">
          <span>
            <span className="block text-sm font-medium text-[#f2f0ef]">Daily AI spend ceiling</span>
            <span className="mt-1 block max-w-xl text-xs leading-5 text-[#a6a4a4]">Requests stop when the shared trial budget is reached. The default is $1 per UTC day.</span>
          </span>
          <span className="flex items-center gap-2 text-sm text-[#a6a4a4] sm:justify-end">
            <span aria-hidden="true">$</span>
            <input
              aria-label="Daily AI spend ceiling in US dollars"
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.01"
              required
              value={values.dailyBudgetDollars}
              onChange={(event) => update('dailyBudgetDollars', event.target.value)}
              className="min-h-11 w-28 rounded-xl bg-[#0d0e11] px-3 text-center text-sm text-[#f2f2ee] shadow-[inset_0_2px_5px_rgb(0_0_0/.35)] outline-none focus-visible:shadow-[0_0_0_2px_rgb(242_242_238/.5),inset_0_2px_5px_rgb(0_0_0/.25)]"
            />
            USD / day
          </span>
        </label>

        <label className="grid gap-3 py-5 sm:grid-cols-[1fr_160px] sm:items-center">
          <span>
            <span className="block text-sm font-medium text-[#f2f0ef]">Monthly AI spend ceiling</span>
            <span className="mt-1 block max-w-xl text-xs leading-5 text-[#a6a4a4]">A second global cap limits total sponsored usage through the end of each UTC month. The default is $10.</span>
          </span>
          <span className="flex items-center gap-2 text-sm text-[#a6a4a4] sm:justify-end">
            <span aria-hidden="true">$</span>
            <input
              aria-label="Monthly AI spend ceiling in US dollars"
              type="number"
              inputMode="decimal"
              min="0"
              max="1000"
              step="0.01"
              required
              value={values.monthlyBudgetDollars}
              onChange={(event) => update('monthlyBudgetDollars', event.target.value)}
              className="min-h-11 w-28 rounded-xl bg-[#0d0e11] px-3 text-center text-sm text-[#f2f2ee] shadow-[inset_0_2px_5px_rgb(0_0_0/.35)] outline-none focus-visible:shadow-[0_0_0_2px_rgb(242_242_238/.5),inset_0_2px_5px_rgb(0_0_0/.25)]"
            />
            USD / month
          </span>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-7">
        <div aria-live="polite" className="min-h-5 text-sm">
          {error ? <p role="alert" className="m-0 text-[#e5a5a5]">{error}</p> : null}
          {message ? <p role="status" className="m-0 text-[#d4d4d7]">{message}</p> : null}
        </div>
        <button type="submit" disabled={saving} className="min-h-11 rounded-full bg-[#f2f2ee] px-5 text-sm font-semibold text-[#171716] shadow-[0_6px_20px_rgb(0_0_0/.24)] transition hover:bg-white hover:shadow-[0_9px_26px_rgb(0_0_0/.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-wait disabled:opacity-60">
          {saving ? 'Saving…' : 'Save trial settings'}
        </button>
      </div>
    </form>
  )
}
