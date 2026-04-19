const fs = require('fs');
const path = require('path');
const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');

const dir = '/Users/dawon/.gemini/antigravity/scratch/princess-playlist';

async function initAndCommit() {
    try {
        console.log('Initializing repository...');
        await git.init({ fs, dir });

        console.log('Adding files...');
        const files = fs.readdirSync(dir).filter(f => !f.startsWith('.'));
        for (const file of files) {
            await git.add({ fs, dir, filepath: file });
        }

        console.log('Committing changes...');
        await git.commit({
            fs,
            dir,
            author: {
                name: 'Antigravity AI',
                email: 'antigravity@google.com'
            },
            message: 'Initial commit: Princess Playlist - ETUDE Makeup Game'
        });

        console.log('Adding remote origin...');
        await git.addRemote({
            fs,
            dir,
            remote: 'origin',
            url: 'https://github.com/hamsterpaik/paik.git'
        });

        console.log('Success! Repository is ready for push.');
    } catch (err) {
        console.error('Error:', err);
    }
}

initAndCommit();
