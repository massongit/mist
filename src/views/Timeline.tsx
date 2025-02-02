import React, { useEffect, useState } from 'react';
import type { FC } from 'react';
import PostForm from './PostForm.js';
import { api } from '../models/misskey.js';
import { sleep } from '../models/util.js';

// import './Timeline.css';

type Props = {
  account: { host: string, accessToken: string } | undefined,
  mode: string,
};

type Note = {
  id: string,
  text: string,
  user: User,
  renote?: Note,
};

type User = {
  name: string,
  username: string
};

const Timeline: FC<Props> = (props) => {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    let isContinued = false;
    (async () => {
      if (props.account == null) return;
      while (!isContinued) {
        try {
          const notes = await api(
            props.account.host,
            'notes/hybrid-timeline',
            props.account.accessToken,
            { limit: 20 });
          setNotes(notes);
        } catch {
          console.error('failed to fetch timeline.');
        }
        await sleep(1000);
      }
    })();
    return () => {
      isContinued = true;
    };
  }, []);

  return (
    <>
      <h2>タイムライン</h2>
      <PostForm
        account={ props.account }
        mode={ props.mode }
      />
      <ul className='timeline-list'>
        {
          notes.map(note =>
            <li key={ note.id } className='note-block'>
              {
                note.renote != null
                  ? <div className='note-header' style={{ color: '#2C5' }}>
                      { note.user.name }がリノート
                    </div>
                  : <div className='note-header'>
                      {note.user.name} @{note.user.username}
                    </div>
              }
              {
                note.renote != null
                  ? <div className='note-body'>
                      @{ note.renote.user.username }: { note.renote.text }
                    </div>
                  : <div className='note-body'>
                      { note.text }
                    </div>
              }
            </li>
          )
        }
      </ul>
    </>
  );
};
export default Timeline;
