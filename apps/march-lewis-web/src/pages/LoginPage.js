const Header = require('../../../shared/components/Header');

function LoginPage() {
  return `
    <div class="page-shell">
      ${Header({
        title: 'Admin Login',
        subtitle: 'Login to access protected March & Lewis admin dashboards'
      })}
      <section class="panel">
        <form id="adminLoginForm" class="form">
          <input name="email" type="email" placeholder="Email" value="admin@qse.local" />
          <input name="password" type="password" placeholder="Password" value="Admin123!" />
          <button type="submit" class="btn primary">Login</button>
        </form>
        <div id="adminLoginResult" class="result"></div>
      </section>
    </div>
  `;
}

module.exports = LoginPage;
