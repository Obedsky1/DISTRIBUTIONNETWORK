import { v4 as uuidv4 } from 'uuid';
import { setDocument } from './lib/firebase/firestore';

async function test() {
    try {
        console.log("Starting test...");
        const newSubmission = {
            id: uuidv4(),
            project_id: 'default_project_id',
            directory_id: 'test',
            directory_name: 'test',
            directory_url: 'test',
            status: 'not_started',
            created_at: new Date(),
            updated_at: new Date()
        };
        await setDocument('directory_submissions', newSubmission.id, newSubmission as any);
        console.log("Success!");
    } catch (e) {
        console.error("Error!!!", e);
    }
}
test();
