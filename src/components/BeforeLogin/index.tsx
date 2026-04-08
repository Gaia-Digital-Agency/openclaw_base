'use client'
import React, { useEffect } from 'react'

const BeforeLogin: React.FC = () => {
  useEffect(() => {
    const injectToggle = () => {
      // Target both the password field and the password confirmation field if present
      const passwordInputs = document.querySelectorAll('input[type="password"]') as NodeListOf<HTMLInputElement>;
      
      passwordInputs.forEach(passwordInput => {
        if (passwordInput && !passwordInput.dataset.hasToggle) {
          passwordInput.dataset.hasToggle = 'true';
          
          // Find the container (Payload 3.0 uses a div with class 'field-type password')
          const container = (passwordInput.closest('.field-type.password') || passwordInput.parentElement) as HTMLElement | null;
          
          if (container) {
            container.style.position = 'relative';
            
            const toggle = document.createElement('button');
            toggle.type = 'button';
            toggle.style.position = 'absolute';
            toggle.style.right = '10px';
            // Adjust position based on whether it's the login form or an edit form
            toggle.style.bottom = '10px'; 
            toggle.style.background = 'transparent';
            toggle.style.border = 'none';
            toggle.style.cursor = 'pointer';
            toggle.style.display = 'flex';
            toggle.style.alignItems = 'center';
            toggle.style.justifyContent = 'center';
            toggle.style.zIndex = '10';
            toggle.style.padding = '5px';
            toggle.innerHTML = '👁️'; // Eye emoji as a simple placeholder
            
            // Adjust for standard Payload styles
            toggle.style.color = 'var(--theme-text)';
            
            toggle.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggle.innerHTML = '🙈';
              } else {
                passwordInput.type = 'password';
                toggle.innerHTML = '👁️';
              }
            };
            
            container.appendChild(toggle);
          }
        }
      });
    };

    // Run immediately and then on an interval to catch dynamically rendered fields
    injectToggle();
    const interval = setInterval(injectToggle, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      <p>
        <b>Welcome to your dashboard!</b>
        {' This is where site admins will log in to manage your website.'}
      </p>
      <div
        style={{
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: '10px',
          padding: '12px 14px',
          background: 'var(--theme-elevation-50)',
        }}
      >
        <p style={{ margin: 0, fontWeight: 700 }}>Login helper</p>
        <p style={{ margin: '8px 0 0' }}>Email: demo-author@example.com</p>
        <p style={{ margin: '4px 0 0' }}>Password: password</p>
      </div>
    </div>
  )
}

export default BeforeLogin
