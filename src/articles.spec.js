const buildUrl = endpointPath => `http://localhost:3000${endpointPath}`;

let sessionCookie;
let testUsername;
let createdArticleId;

describe('For Articles', () => {

    it('register', (done) => {
        let randomValue = Math.random();
        let randomId = Math.floor(randomValue * 1000);
        testUsername = 'testUser' + randomId;
        const registrationPayload = {
            username: testUsername,
            email: testUsername + '@aaa.bbb',
            dob: '1999-09-09',
            phone: '333-222-1111',
            zipcode: '66666',
            password: '123'
        };
        fetch(buildUrl('/register'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registrationPayload)
        })
            .then(response => response.json())
            .then(responseBody => {
                done();
            });
    });

    it('login', (done) => {
        const loginPayload = { username: testUsername, password: '123' };
        fetch(buildUrl('/login'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginPayload)
        })
            .then(response => {
                sessionCookie = response.headers.get('set-cookie');
                return response.json();
            })
            .then(() => {
                done();
            });
    });

    it('Unit test to validate GET /articles', (done) => {
        fetch(buildUrl('/articles'), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'cookie': sessionCookie
            }
        })
            .then(response => response.json())
            .then(responseBody => {
                expect(responseBody.articles.length).toBeGreaterThan(-1);
                done();
            });
    });

    it('Unit test to validate POST /article', (done) => {
        const articlePayload = { text: 'yooo! give me five~' };
        fetch(buildUrl('/article'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'cookie': sessionCookie
            },
            body: JSON.stringify(articlePayload)
        })
            .then(response => response.json())
            .then(responseBody => {
                expect(responseBody.articles.length).toEqual(1);
                const createdArticle = responseBody.articles[0];
                expect(createdArticle.author).toEqual(testUsername);
                expect(createdArticle.text).toEqual(articlePayload.text);
                createdArticleId = createdArticle.id;
                done();
            });
    });

    it('Unit test to validate GET /articles/:id', (done) => {
        fetch(buildUrl(`/articles/` + createdArticleId), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'cookie': sessionCookie
            }
        })
            .then(response => response.json())
            .then(responseBody => {
                expect(responseBody.articles.length).toBe(1);
                const fetchedArticle = responseBody.articles[0];
                expect(fetchedArticle.id).toBe(createdArticleId);
                done();
            });
    });
});