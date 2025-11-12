app/
│
├── _layout.tsx               # (El "Jefe" Stack principal que ya tienes)
│
├── index.tsx                 # (Tu 'welcome_screen')
├── login.tsx                 # (Pantalla de Login)
├── register.tsx              # (Pantalla de Registro)
├── forgot_password.tsx       # (Recuperar contraseña)
│
│
├── (tabs)/                   # (Este es el "corazón" de tu app autenticada)
│   │
│   ├── _layout.tsx           # 1. EL "JEFE DE PESTAÑAS" (Define las 3 tabs)
│   │
│   ├── index.tsx             # 2. Tab 1: Home (Publicaciones)
│   │
│   ├── chat.tsx              # 3. Tab 2: Lista de Conversaciones/Amigos
│   │
│   └── profile.tsx           # 4. Tab 3: Perfil de Usuario
│
│
├── post/                     # (Carpeta para detalles)
│   └── [id].tsx              # 5. Detalles de Publicación (Pantalla dinámica)
│
├── chat/
│   └── [id].tsx              # 6. Conversación Individual (Pantalla dinámica)
│
├── settings.tsx              # 7. Pantalla de Configuración
├── achievements.tsx          # 8. Pantalla de Logros
├── add-friends.tsx           # 9. Pantalla de Agregar Amigos
│
└── (admin)/                  # (Grupo solo para rutas de admin)
    └── crud-post.tsx         # 10. CRUD de Publicaciones