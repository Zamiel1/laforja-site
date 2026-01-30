README — Despliegue y HTTPS para La Forja
=========================================

Objetivo
--------
Hacer que el sitio en esta carpeta sea accesible en https://www.laforja.com.mx y dar pasos para desplegarlo.

Opciones recomendadas
---------------------
1) Netlify (rápido, HTTPS automático)
   - Ventajas: despliegue en minutos, HTTPS automático, dominio personalizado fácil.
   - Pasos (drag & drop):
     1. Comprime la carpeta del sitio (ej. `site.zip`) o abre Netlify y arrastra la carpeta con `index.html`.
     2. Netlify publicará el sitio y asignará un dominio `*.netlify.app` con HTTPS.
     3. En Netlify > Domain settings, añade `www.laforja.com.mx` como dominio personalizado. Sigue los pasos DNS (CNAME/ALIAS).
     4. Netlify genera y renueva automáticamente certificados TLS.

   - Pasos (CLI, opcional):
     ```bash
     npm install -g netlify-cli
     netlify deploy --dir=./ -p   # deploy production
     ```

2) GitHub Pages (si tu repo está en GitHub)
   - Ventajas: gratis, HTTPS automático para `github.io` y para dominios personalizados con configuración DNS.
   - Pasos:
     1. Subir los archivos al repo GitHub.
     2. Activar GitHub Pages (branch `main` / folder `/root` o `/docs`).
     3. En Settings > Pages añadir `www.laforja.com.mx` y configurar DNS (A records / CNAME).
     4. GitHub emite certificado TLS automático.

3) VPS con Nginx + Certbot (control total)
   - Ventajas: control de servidor, adecuado para producción con backend.
   - Requisitos: servidor Ubuntu/Debian con IP pública, dominio apuntando al servidor.
   - Pasos resumidos:
     ```bash
     # instalar nginx
     sudo apt update && sudo apt install -y nginx

     # crear un bloque de servidor /etc/nginx/sites-available/laforja
     # example server block:
     # server {
     #   listen 80;
     #   server_name www.laforja.com.mx laf orja.com.mx;
     #   root /var/www/laforja;
     #   index email.html index.html;
     # }

     sudo nginx -t
     sudo systemctl reload nginx

     # instalar certbot y obtener certificado
     sudo apt install -y certbot python3-certbot-nginx
     sudo certbot --nginx -d www.laforja.com.mx -d laforja.com.mx
     ```
   - Certbot configura HTTPS (Let's Encrypt) y renueva automáticamente.

Pruebas locales con HTTPS
-------------------------
- Opción rápida (sin HTTPS real): servir localmente y abrir `http://localhost:8000`.
  ```bash
  # desde la carpeta d:\DATAGEN\Correos.HTML
  python -m http.server 8000
  ```
- HTTPS local (desarrollo): usar `mkcert` para certificados locales confiables.
  ```bash
  choco install mkcert  # Windows (con Chocolatey)
  mkcert -install
  mkcert localhost 127.0.0.1 ::1
  # luego configurar un servidor local (e.g., http-server) con esos certificados
  ```

Consideraciones y notas
-----------------------
- Ya se añadió `<base href="https://www.laforja.com.mx/">` en las páginas. Si despliegas en una subruta, revisa y ajusta.
- Para que el dominio resuelva, configura los registros DNS en el registrador del dominio:
  - Netlify: CNAME para `www` a `your-site.netlify.app` o usar Netlify DNS.
  - VPS: A record apuntando a la IP del servidor.
- HTTPS (TLS) siempre requiere que el dominio apunte al host donde se solicita el certificado.

Generar ZIP listo para subir
---------------------------
En PowerShell (Windows), desde el directorio que contiene la carpeta `Correos.HTML`:
```powershell
Compress-Archive -Path .\Correos.HTML\* -DestinationPath .\laforja-site.zip -Force
```

Siguientes pasos que puedo hacer por ti
--------------------------------------
- Preparar el ZIP listo ahora (lo genero en el repo).  
- Generar un `README-deploy-VPS.md` con bloques de Nginx más detallados.  
- Ayudarte a configurar Netlify (te doy los comandos y te explico los DNS exactos).  

¿Quieres que genere el ZIP ahora y/o que prepare instrucciones detalladas para VPS con Nginx + Certbot?