# Bingofy frontend

SPA del bingo musical. El host prepara la sala en el ordenador y los jugadores entran desde el móvil con el QR o con el código.

## Cómo se juega

Suena una canción, cada jugador busca su carátula en su cartón y la marca. Gana quien completa una línea o el cartón entero y lo canta a tiempo.

Hacen falta dos cosas: un ordenador conectado a la tele, que hace de host y reproduce la música, y un móvil por jugador. Todos tienen que estar en la misma red que el servidor, o el servidor debe ser accesible desde sus móviles.

### Como host

Necesitas una cuenta de Spotify Premium. La música suena en el navegador del ordenador, no en el móvil.

1. **Entra en Bingofy** desde el ordenador y pulsa **Soy el host**, o ve a `/host`. Pulsa **Conectar con Spotify** y autoriza la cuenta.
2. **Elige las playlists** de las que saldrán las canciones. Solo aparecen las que tienen al menos 100 canciones válidas, y se pueden elegir varias. Si entre todas suman entre 100 y 150 canciones, la app avisa de que habrá poca variedad.
3. **Pulsa Crear sala.** La tele muestra el QR, la dirección con el código y el código en fichas grandes. Los jugadores van apareciendo en la lista. Pueden entrar hasta 50.
4. **Pulsa Activar reproductor** y espera a que el estado del reproductor diga "listo". Hay que hacerlo en cada carga de la página, porque el navegador no deja sonar el audio sin un clic. **Empezar partida** no se habilita hasta entonces.
5. **Pulsa Empezar partida.** Desde ese momento nadie más puede entrar en la sala.

Durante la partida, la tele muestra el disco con la canción actual, la cuenta atrás y las canciones que ya sonaron, la última arriba. Los controles son:

| Botón | Qué hace |
| --- | --- |
| Siguiente | Salta a la siguiente canción sin esperar a que termine el corte |
| Pausa | Para la música y la cuenta atrás. Se continúa con **Reanudar** |
| Seguir | Aparece tras un bingo y pone la siguiente canción |
| Terminar | Cierra la partida |

Cada canción suena un corte de 20 segundos y pasa sola a la siguiente. El reloj empieza cuando Spotify confirma que la canción suena. La duración se cambia con `SONG_CLIP_SECONDS` en el backend.

Cuando un jugador canta un bingo válido, la partida se pausa y la tele enseña su nombre y si fue línea o cartón completo. Para continuar pulsa **Seguir**. La partida termina también cuando se acaban las canciones.

Si recargas la página del host, la sala sigue existiendo. Vuelve a pulsar **Activar reproductor**. Si la sesión de Spotify caduca, aparece un aviso con el botón **Reconectar Spotify** y no se pierde la sala.

### Como jugador

1. **Entra en la sala** escaneando el QR con la cámara del móvil. También puedes abrir la web, escribir el código de 6 caracteres y pulsar **Entrar**.
2. **Elige tu nombre** y pulsa **Entrar**. Recibes tu cartón. Si la partida ya empezó, la app lo explica y no deja entrar.
3. **Espera** a que el host empiece. Arriba ves la canción que suena, con su carátula, y los segundos que quedan.
4. **Marca las casillas.** Cada casilla es una canción con su carátula, título y artista. Cuando suene una de tu cartón, tócala y se marca con una mancha amarilla. Vuelve a tocarla para desmarcarla.
5. **Canta cuando completes algo.** Pulsa **¡Bingo!** si tienes una línea, o **Cartón completo** si tienes todas las casillas. Los botones se habilitan cuando la partida está en marcha o en pausa.

Si cierras la pestaña o se corta la conexión, vuelve a abrir el enlace de la sala y recuperas tu cartón, con las marcas hechas.

### Reglas del bingo

- **Cartón:** cuadrícula de 5×5 con 25 canciones distintas, distinta para cada jugador. El tamaño sale de `BOARD_SIZE` en el backend. Si `FREE_CENTER` está activo, la casilla central es "Libre" y cuenta como marcada.
- **Línea:** cinco casillas seguidas en una fila, una columna o una de las dos diagonales.
- **Cartón completo:** todas las casillas marcadas.
- **Marcar es libre, pero se comprueba al cantar.** Si tienes marcada una canción que todavía no ha sonado, el bingo se rechaza entero con el aviso "Hay casillas marcadas de canciones que todavía no han sonado". Desmárcala y vuelve a intentarlo.
- **Un mismo jugador no cobra dos veces el mismo premio.** Puede ganar una línea y después el cartón completo.
- **Un bingo rechazado** solo lo ve quien lo cantó. Uno válido lo ven todos.
- **Límite de intentos:** cada jugador puede cantar hasta 10 veces por minuto.

## Dependencias

Consulta de dependencias: 14 de noviembre de 2026. Vue, Vue Router, Socket.IO y `qrcode` se contrastaron con Context7. El Web Playback SDK se contrastó con la referencia oficial de Spotify. El resto de versiones salen de `npm view` el mismo día.

| Paquete | Versión |
| --- | --- |
| vue | 3.5.45 |
| vite | 8.3.8 |
| @vitejs/plugin-vue | 6.0.11 |
| vue-router | 5.5.1 |
| pinia | 4.1.0 |
| axios | 1.21.1 |
| socket.io-client | 4.8.4 |
| qrcode | 1.5.4 |
| vitest | 5.1.0 |
| @vue/test-utils | 2.5.1 |
| jsdom | 31.0.1 |
| @fontsource-variable/archivo | 5.3.0 |

## Arranque

```bash
cp .env.example .env
npm install
npm run dev
```

`npm run dev` escucha en la red (`--host`) para que un móvil en la misma wifi pueda abrir el QR.

Variables:

| Variable | Qué poner |
| --- | --- |
| `VITE_API_BASE_URL` | URL del backend, por ejemplo `http://192.168.1.20:3000` |
| `VITE_SOCKET_URL` | La misma URL del backend |
| `VITE_PUBLIC_APP_URL` | URL pública de este frontend, la que va dentro del QR |

`VITE_PUBLIC_APP_URL` tiene que coincidir con `FRONTEND_URL` del backend. En el móvil no uses `localhost`: el QR llevaría al propio teléfono. El código de sala que acepta el inicio tiene 6 caracteres del alfabeto del backend (`ROOM_CODE_LENGTH=6`, sin I, O, 0 ni 1).

Ningún secreto de Spotify entra en este proyecto. El access token del reproductor se pide en cada uso a `GET /auth/spotify/token`.

## Diseño

Identidad de funda de disco: cobalto, blanco azulado, amarillo de bola de bingo y coral. Los tokens están en `src/styles/variables.css` y usan `light-dark()`: el tema sigue al sistema, salvo la sala del host, que fuerza la noche (`.theme-night`) para no deslumbrar en una tele.

- **Tipografía:** Archivo variable con eje de anchura (`@fontsource-variable/archivo/wdth.css`), empaquetada con Vite. Condensada y pesada para titulares, ancho normal para el texto. Fontsource se contrastó con Context7 el 14 de noviembre de 2026.
- **Host (`/host/sala/:code`):** pensado para un portátil conectado a la tele. Con ancho de al menos 900 px y alto de al menos 520 px ocupa la pantalla sin scroll y todo escala con el ancho de la ventana (`font-size: clamp(16px, 1.35vw, 80px)` y unidades `em`). Por debajo de esos tamaños, por ejemplo desde un teléfono, se apila, hace scroll y los controles quedan fijos abajo.
- **Jugador:** móvil primero. La canción actual queda fija arriba y los botones de bingo fijos abajo. El texto de las casillas se ajusta con container queries al tamaño del cartón (`BOARD_SIZE`).
- **Cuenta atrás:** el backend envía `clipEndsAt` pero no la duración del corte, así que `useClipCountdown` la deduce del primer instante en que ve cada corte. Tras reconectar a mitad de un corte, el arco se corrige con el siguiente.
- Marcar casillas no depende solo del color: la mancha amarilla lleva una marca de verificación.

## Cookies

El backend guarda la sesión del host en la cookie `bingofy.sid`: `httpOnly`, `sameSite=lax` y `secure` solo en producción. El CORS permite un único origen, `FRONTEND_URL`, con credenciales. En local, `localhost:5173` y `localhost:3000` comparten sitio y la cookie viaja. En producción el frontend y el backend tienen que estar en el mismo sitio (`app.ejemplo.com` y `api.ejemplo.com`, o el API bajo el mismo dominio). Con dominios distintos, `SameSite=Lax` no adjunta la cookie y el login parece no funcionar.

## Producción

El hosting debe responder `index.html` en cualquier ruta. Si no, `/sala/CÓDIGO` abierto desde el QR devuelve 404. Vite ya lo hace en `dev` y `preview`.

## Pruebas

```bash
npm test
```

## Decisiones alineadas con el backend

- Unirse con la partida empezada responde `ROOM_NOT_IN_LOBBY`. La pantalla lo explica y no deja entrar.
- `POST /api/rooms/:code/join` devuelve `playerId` y el cartón. Al reconectar, el socket `room:join` vuelve a enviar el cartón en `player:card`.
- El id de pista del servidor es `spotify:track:…`. El SDK confirma con el id corto; el cliente compara ambos y envía a `song:confirmed` el id del servidor.
