import { createStore, applyMiddleware } from 'redux'
import { Value } from 'slate'
import { default as loggerMiddleware } from 'redux-logger'

import reducers from './reducers/'
import * as actions from './actions'
import { commands as commandsMiddleware } from './middleware/'
import userGuide from './user_guide'

const activeNoteId = localStorage.getItem('activeNoteId')
const keys = (() => {
  const out = []
  for (let i = 0; i < localStorage.length; i++ ) {
    out.push(localStorage.key(i))
  }
  return out
})()
  .filter(k => k.includes('note:'))
  .map(k => k.split('note:')[1])


const notesById = keys
  .reduce((notes, noteId) => {
    const savedNote = JSON.parse(localStorage.getItem(`note:${noteId}`))

    if (savedNote) {
      const note = {
        ...savedNote,
        value: Value.fromJSON(savedNote.value)
      }
      notes[noteId] = note
    }

    return notes
  }, {})

const initialState = {
  notes: {
    notesById,
    activeNoteId
  }
}

const store = createStore(
  reducers,
  initialState,
  applyMiddleware(
    commandsMiddleware,
    loggerMiddleware
  )
)

store.subscribe(() => {
  const state = store.getState()
  const activeNote = state.notes.notesById[state.notes.activeNoteId]
  const noteString = JSON.stringify({
    ...activeNote,
    value: activeNote.value.toJSON()
  })

  localStorage.setItem('activeNoteId', state.notes.activeNoteId)
  localStorage.setItem(`note:${activeNote.id}`, noteString)
})

if (keys.length === 0) {
  store.dispatch(actions.newNote('# I am another note'))
  store.dispatch(actions.newNote(userGuide))
}

export default store;
