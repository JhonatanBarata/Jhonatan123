const http = require('http');

function request(method, path, data, token) {
  return new Promise((resolve, reject) => {
    const d = data ? JSON.stringify(data) : null;
    const opts = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': d ? Buffer.byteLength(d) : 0,
      },
    };
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(opts, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        let parsed = body;
        try { parsed = JSON.parse(body); } catch (e) {}
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    req.on('error', reject);
    if (d) req.write(d);
    req.end();
  });
}

async function run() {
  try {
    const MASTER_EMAIL = 'jbinformatica1100@gmail.com';
    const MASTER_PASSWORD = 'Perspective';

    console.log('1) Master login');
    const mLogin = await request('POST', '/auth/login', { email: MASTER_EMAIL, password: MASTER_PASSWORD });
    if (!mLogin.body || !mLogin.body.token) throw new Error('Master login failed: no token');
    const masterToken = mLogin.body.token || (mLogin.body.token === undefined && mLogin.body.token) ? mLogin.body.token : mLogin.body.token || mLogin.body.token;
    // support responses where token is root or inside body
    const mt = mLogin.body.token || mLogin.token || (mLogin.body && mLogin.body.token) || (mLogin.body && mLogin.body.token) || mLogin.body.token;
    const master = mLogin.body.token ? mLogin.body.token : mLogin.token ? mLogin.token : (mLogin.body && mLogin.body.token) ? mLogin.body.token : mLogin.body && mLogin.body.token;
    const token = mLogin.body.token || mLogin.token || (mLogin.body && mLogin.body.token) || (typeof mLogin.body === 'string' && JSON.parse(mLogin.body).token) || null;
    const masterTok = token || mLogin.body || mLogin.token;
    // simpler: extract any token field
    const extractedMasterToken = (mLogin.body && (mLogin.body.token || mLogin.body.token)) || mLogin.token || (mLogin.body && mLogin.body.token) || (mLogin.body && mLogin.body.token) || (typeof mLogin.body === 'string' && JSON.parse(mLogin.body).token);
    const masterTokenFinal = extractedMasterToken || (mLogin.body && mLogin.body.token) || (mLogin.token) || null;
    if (!masterTokenFinal) throw new Error('Master token extraction failed');

    // quick helper to log status
    console.log('Master token acquired');

    console.log('2) POST /admin/users without token (expect 401/403)');
    const rNoToken = await request('POST', '/admin/users', { email: 'noauth@example.com', password: 'P@ssw0rd', role: 'USER' }, null);
    console.log(' ->', rNoToken.status, JSON.stringify(rNoToken.body));
    if (rNoToken.status === 200 || rNoToken.status === 201) throw new Error('Unauthenticated request unexpectedly allowed');

    console.log('3) POST /admin/users with MASTER (expect 201)');
    const rCreateAdmin = await request('POST', '/admin/users', { email: 'admin-created@example.com', password: 'Admin12345', role: 'ADMIN' }, masterTokenFinal);
    console.log(' ->', rCreateAdmin.status, JSON.stringify(rCreateAdmin.body));
    let adminId = null;
    if (rCreateAdmin.status === 201) {
      adminId = rCreateAdmin.body && rCreateAdmin.body.id;
    } else {
      // if create failed (likely duplicate) try to login — proceed if login works
      console.log('Master create returned', rCreateAdmin.status, '— attempting login to continue');
    }

    console.log('4) Login as ADMIN (created)');
    const adminLogin = await request('POST', '/auth/login', { email: 'admin-created@example.com', password: 'Admin12345' });
    console.log(' ->', adminLogin.status, JSON.stringify(adminLogin.body));
    if (!adminLogin.body || !adminLogin.body.token) throw new Error('Admin login failed');
    const adminToken = adminLogin.body.token || adminLogin.token;
    console.log(' -> admin token acquired');

    console.log('5) ADMIN creating regular user (expect 201)');
    const rCreateUserByAdmin = await request('POST', '/admin/users', { email: 'user-by-admin@example.com', password: 'User12345', role: 'USER' }, adminToken);
    console.log(' ->', rCreateUserByAdmin.status, JSON.stringify(rCreateUserByAdmin.body));
    let userId = null;
    if (rCreateUserByAdmin.status === 201) {
      userId = rCreateUserByAdmin.body && rCreateUserByAdmin.body.id;
    } else {
      console.log('Admin create returned', rCreateUserByAdmin.status, '— attempting login to continue');
      const maybeLogin = await request('POST', '/auth/login', { email: 'user-by-admin@example.com', password: 'User12345' });
      console.log(' -> login attempt:', maybeLogin.status, JSON.stringify(maybeLogin.body));
      if (!maybeLogin.body || !maybeLogin.body.token) throw new Error('Admin could not create user and login fallback failed');
      // userId not strictly required for role-change test; try to fetch id from message if present
      if (maybeLogin.body.user && maybeLogin.body.user.id) userId = maybeLogin.body.user.id;
    }

    console.log('6) ADMIN attempts to change role (PUT /admin/users/:id/role) (expect 403)');
    const changeByAdmin = await request('PUT', `/admin/users/${userId}/role`, { role: 'ADMIN' }, adminToken);
    console.log(' ->', changeByAdmin.status, JSON.stringify(changeByAdmin.body));
    if (changeByAdmin.status !== 403) throw new Error('Admin should not be allowed to change roles (MASTER only)');

    console.log('7) MASTER changes role (expect 200)');
    const changeByMaster = await request('PUT', `/admin/users/${userId}/role`, { role: 'ADMIN' }, masterTokenFinal);
    console.log(' ->', changeByMaster.status);
    if (changeByMaster.status !== 200) throw new Error('Master failed to change role: ' + JSON.stringify(changeByMaster.body));

    console.log('8) create regular user via /auth/register and try admin action (expect 403)');
    const reg = await request('POST', '/auth/register', { email: 'simple-user@example.com', password: 'UserPw1' });
    if (!reg.body || !reg.body.token) {
      // some register flows return token differently; try login
      await request('POST', '/auth/register', { email: 'simple-user@example.com', password: 'UserPw1' });
    }
    const loginUser = await request('POST', '/auth/login', { email: 'simple-user@example.com', password: 'UserPw1' });
    const userToken = loginUser.body && loginUser.body.token;
    const attemptByUser = await request('POST', '/admin/users', { email: 'should-fail@example.com', password: 'P1' }, userToken);
    console.log(' ->', attemptByUser.status);
    if (attemptByUser.status !== 403) throw new Error('Regular user should be forbidden from admin route');

    console.log('\nAll RBAC checks passed ✅');
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

if (require.main === module) run();

module.exports = { run };
