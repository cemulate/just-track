import Dexie from 'dexie';

const db = new Dexie('JustTrackDatabase');

db.version(1).stores({
    tasks: '++id, name',
    timeEntries: '++id, start, end, taskId',
});

export default db;
