fetch('http://localhost:3000/api/submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        project_id: 'default_project_id',
        user_id: 'test_user_id',
        directory_id: 'https://example.com',
        directory_name: 'test directory',
        directory_url: 'https://example.com'
    })
}).then(async r => {
    console.log(r.status);
    console.log(await r.text());
});
