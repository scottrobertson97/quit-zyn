import { useState } from 'react'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { EmptyState } from '../../components/EmptyState'
import { Field, SelectInput, TextArea } from '../../components/FormField'
import { usePouchlessStore } from '../../app/store'
import { journalPrompts, triggerLabels } from '../../domain/constants'
import { formatTimeOfDay } from '../../domain/date'
import { createId } from '../../domain/id'

export function JournalScreen() {
  const journalEntries = usePouchlessStore((state) => state.journalEntries)
  const cravingLogs = usePouchlessStore((state) => state.cravingLogs)
  const addJournalEntry = usePouchlessStore((state) => state.addJournalEntry)
  const [prompt, setPrompt] = useState(journalPrompts[0])
  const [body, setBody] = useState('')
  const [relatedCravingId, setRelatedCravingId] = useState('')

  const submit = async () => {
    if (!body.trim()) {
      return
    }

    await addJournalEntry({
      id: createId('journal'),
      timestamp: new Date().toISOString(),
      prompt,
      body: body.trim(),
      relatedCravingId: relatedCravingId || undefined,
    })

    setBody('')
    setRelatedCravingId('')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <p className="text-sm font-semibold text-teal-700">Journal</p>
        <h1 className="text-3xl font-semibold">Notice the pattern</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Optional reflection for the craving beneath the craving.
        </p>
      </div>

      <Card>
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
            void submit()
          }}
        >
          <Field label="Prompt">
            <SelectInput
              value={prompt}
              onChange={(event) => setPrompt(event.currentTarget.value)}
            >
              {journalPrompts.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </SelectInput>
          </Field>

          <Field label="Related craving" helper="Optional">
            <SelectInput
              value={relatedCravingId}
              onChange={(event) => setRelatedCravingId(event.currentTarget.value)}
            >
              <option value="">No linked craving</option>
              {cravingLogs.slice(0, 20).map((log) => (
                <option key={log.id} value={log.id}>
                  {formatTimeOfDay(log.startedAt)} - {triggerLabels[log.trigger]}
                </option>
              ))}
            </SelectInput>
          </Field>

          <Field label="Entry">
            <TextArea
              required
              value={body}
              onChange={(event) => setBody(event.currentTarget.value)}
              placeholder="One honest sentence is enough."
            />
          </Field>

          <Button type="submit">Save entry</Button>
        </form>
      </Card>

      {journalEntries.length === 0 ? (
        <EmptyState title="No entries yet">
          Journal entries are optional. Use this when writing helps you catch a
          pattern earlier.
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {journalEntries.map((entry) => (
            <Card key={entry.id}>
              <p className="text-sm font-semibold text-teal-700">
                {formatTimeOfDay(entry.timestamp)}
              </p>
              <h2 className="mt-1 text-lg font-semibold">{entry.prompt}</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {entry.body}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
