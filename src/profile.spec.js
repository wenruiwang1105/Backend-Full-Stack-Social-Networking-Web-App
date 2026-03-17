const buildUrl = endpointPath => `http://localhost:3000${endpointPath}`;
let sessionCookie;
let testUsername;
let testHeadline;

describe('Headline and auth', () => {

    it('Unit test to validate POST /register', (done) => {
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
                expect(responseBody.username).toEqual(testUsername);
                expect(responseBody.result).toEqual('success');
                done();
            });
    });

    it('Unit test to validate POST /login', (done) => {
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
            .then(responseBody => {
                expect(responseBody.username).toEqual(testUsername);
                expect(responseBody.result).toEqual('success');
                done();
            });
    });

    it('Unit test to validate PUT /headline', (done) => {
        testHeadline = 'I am sooooo good~';
        fetch(buildUrl('/headline'), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'cookie': sessionCookie
            },
            body: JSON.stringify({ headline: testHeadline })
        })
            .then(response => response.json())
            .then(responseBody => {
                expect(responseBody.username).toEqual(testUsername);
                expect(responseBody.headline).toEqual(testHeadline);
                done();
            });
    });

    it('Unit test to validate GET /headline', (done) => {
        fetch(buildUrl('/headline'), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'cookie': sessionCookie
            }
        })
            .then(response => response.json())
            .then(responseBody => {
                expect(responseBody.username).toEqual(testUsername);
                expect(responseBody.headline).toEqual(testHeadline);
                done();
            });
    });

    it('Unit test to validate PUT /logout', (done) => {
        fetch(buildUrl('/logout'), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'cookie': sessionCookie
            }
        })
            .then(response => response.text())
            .then(responseText => {
                expect(responseText).toEqual('out');
                done();
            });
    });
});