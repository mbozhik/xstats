'use client'

import {useState} from 'react'

import {Button} from '~/ui/button'
import {InputGroup, InputGroupAddon, InputGroupInput, InputGroupText} from '~/ui/input-group'

export default function GeneratorForm() {
  const [username, setUsername] = useState('')

  return (
    <section data-section="generator-form-index" className="space-y-4">
      <div className="flex gap-2">
        <InputGroup>
          <InputGroupInput placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} className="flex-1 !pl-1 !pt-0.5" />

          <InputGroupAddon>
            <InputGroupText>
              x.com <span className="!-ml-1.75">/</span>
            </InputGroupText>
          </InputGroupAddon>
        </InputGroup>

        <Button disabled={!username.trim()}>Generate</Button>
      </div>
    </section>
  )
}
