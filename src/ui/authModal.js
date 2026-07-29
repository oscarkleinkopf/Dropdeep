import {
  isAuthConfigured,
  signIn,
  signUp,
  signInWithGoogle,
  onAuthStateChange
} from '../auth/auth.js';
import { showToast } from '../utils/toast.js';

let authMode = 'login';

export function openAuthModal(mode = 'login') {
  if (!isAuthConfigured) {
    showToast('Las cuentas no están configuradas en este despliegue.', 'info');
    return;
  }
  authMode = mode;
  const modal = document.getElementById('auth-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  updateAuthModalUI();
  document.getElementById('auth-email-input')?.focus();
  lucide.createIcons();
}

export function closeAuthModal() {
  document.getElementById('auth-modal')?.classList.add('hidden');
  clearAuthForm();
}

function clearAuthForm() {
  const form = document.getElementById('auth-form');
  form?.reset();
  const err = document.getElementById('auth-error');
  if (err) {
    err.textContent = '';
    err.classList.add('hidden');
  }
}

function updateAuthModalUI() {
  const isLogin = authMode === 'login';
  document.getElementById('auth-modal-title').textContent = isLogin
    ? 'Iniciar sesión'
    : 'Crear cuenta';
  document.getElementById('auth-submit-btn').textContent = isLogin
    ? 'Entrar'
    : 'Registrarse';
  document.getElementById('auth-toggle-mode-btn').textContent = isLogin
    ? '¿No tienes cuenta? Regístrate'
    : '¿Ya tienes cuenta? Inicia sesión';
  document.getElementById('auth-google-btn')?.classList.remove('auth-google-stub');
}

function showAuthError(message) {
  const err = document.getElementById('auth-error');
  if (!err) return;
  err.textContent = message;
  err.classList.remove('hidden');
}

function mapAuthError(error) {
  const msg = error?.message || 'Error de autenticación';
  if (msg.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (msg.includes('User already registered')) return 'Este correo ya está registrado.';
  if (msg.includes('Password should be at least')) return 'La contraseña debe tener al menos 6 caracteres.';
  if (msg.includes('Unable to validate email')) return 'Correo electrónico no válido.';
  if (msg.includes('Email not confirmed')) return 'Confirma tu correo antes de iniciar sesión.';
  if (msg.toLowerCase().includes('provider is not enabled')) {
    return 'Google no está habilitado aún en Supabase (Authentication → Providers).';
  }
  return msg;
}

export function initAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (!modal || !isAuthConfigured) return;

  document.getElementById('close-auth-dot')?.addEventListener('click', closeAuthModal);
  document.getElementById('close-auth-btn')?.addEventListener('click', closeAuthModal);

  document.getElementById('auth-toggle-mode-btn')?.addEventListener('click', () => {
    authMode = authMode === 'login' ? 'signup' : 'login';
    updateAuthModalUI();
    clearAuthForm();
  });

  document.getElementById('auth-google-btn')?.addEventListener('click', async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      showAuthError(mapAuthError(err));
    }
  });

  document.getElementById('auth-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email-input')?.value.trim();
    const password = document.getElementById('auth-password-input')?.value;
    if (!email || !password) return;

    const submitBtn = document.getElementById('auth-submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Procesando…';

    try {
      if (authMode === 'signup') {
        const { user, session } = await signUp(email, password);
        if (session) {
          showToast('Cuenta creada e iniciada.', 'success');
        } else if (user && !user.email_confirmed_at && !user.confirmed_at) {
          showToast('Revisa tu correo para confirmar la cuenta, luego inicia sesión.', 'success');
        } else {
          showToast('Cuenta creada correctamente.', 'success');
        }
      } else {
        await signIn(email, password);
        showToast('Sesión iniciada.', 'success');
      }
      closeAuthModal();
    } catch (err) {
      showAuthError(mapAuthError(err));
    } finally {
      submitBtn.disabled = false;
      updateAuthModalUI();
    }
  });

  onAuthStateChange((session) => {
    if (session?.user) closeAuthModal();
  });
}
