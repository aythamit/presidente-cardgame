Documento de Especificaciones: App "El Presidente"
1. Resumen del Proyecto
Creación de una aplicación móvil (iOS y Android) y/o web que simule el clásico juego de cartas "El Presidente" (también conocido como Culo o Escoria). La app permitirá jugar partidas rápidas contra la Inteligencia Artificial (IA) o multijugador online con amigos.

2. Reglas y Lógica del Juego (Motor Principal)
Para programar la lógica, el motor del juego debe seguir estas reglas estándar:

2.1. La Baraja y Jerarquía
Baraja: Baraja francesa estándar de 52 cartas (sin comodines/jokers, aunque se pueden añadir como variante en los ajustes).

Jerarquía de Cartas (De menor a mayor): 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, As.

La Carta Especial (El 2): El 2 actúa como carta de "corte" o "limpieza". Si alguien tira un 2, la mesa se limpia automáticamente y ese jugador vuelve a tirar cualquier carta para iniciar una nueva ronda.

2.2. Flujo del Turno
Reparto: Se reparten todas las cartas equitativamente entre los jugadores (ideal para 4 a 6 jugadores).

Inicio: En la primera partida, empieza el jugador que tenga el 3 de Tréboles (o una carta designada).

Jugadas: * Se pueden jugar cartas individuales, parejas, tríos o cuartetos.

El siguiente jugador debe tirar el mismo número de cartas pero de un valor estrictamente superior (ej. si se tira una pareja de 5, el siguiente debe tirar una pareja de 6 o superior).

Pasar: Un jugador puede "pasar" su turno si no tiene cartas para superar la mesa o si decide guardarlas por estrategia.

Reinicio de Mesa: Si todos los jugadores pasan después de una jugada, la mesa se limpia y el último jugador que tiró comienza la nueva ronda.

3. Sistema de Roles (La clave de la App)
La lógica debe registrar el orden en el que los jugadores se quedan sin cartas para asignar los roles en la siguiente ronda:

1º Lugar (El Presidente): Recibe las 2 mejores cartas de La Escoria. A cambio, le da sus 2 peores cartas.

2º Lugar (El Vicepresidente): Recibe la mejor carta del Vice-Escoria. A cambio, le da su peor carta.

Lugares Medios (Ciudadanos): No intercambian cartas.

Penúltimo Lugar (Vice-Escoria): Debe darle su mejor carta al Vicepresidente.

Último Lugar (Escoria / Culo): Debe darle sus 2 mejores cartas al Presidente.

4. Diseño de la Interfaz de Usuario (UI) y Experiencia (UX)
La aplicación debe tener pantallas claras e intuitivas.

Pantallas Principales:
Menú Principal: Botones para "Jugar Offline (vs IA)", "Jugar Online", "Crear Sala Privada", "Reglas" y "Ajustes".

Sala de Juego (El Tapete):

Vista del jugador: Sus cartas dispuestas en abanico en la parte inferior de la pantalla.

Centro de la mesa: Donde se apilan las cartas jugadas en la ronda actual.

Avatares de oponentes: Colocados alrededor de la mesa con indicadores de cuántas cartas les quedan.

Botones de acción: Un botón claro para "Jugar Carta(s)" y otro para "Pasar".

Pantalla de Roles (Fin de partida): Una pantalla de victoria/derrota que muestre una animación divertida de quién es el nuevo Presidente y quién la Escoria, seguido de la fase de intercambio de cartas.

5. Arquitectura Técnica de la App
Para el equipo de desarrollo, la app se dividirá en estos módulos:

Frontend (Cliente): Recomendado usar motores de juego ligeros como Unity (si quieres animaciones muy fluidas y efectos) o frameworks como React Native / Flutter si prefieres un enfoque más de app tradicional con animaciones de UI.

Backend (Servidor para Multijugador): * Uso de WebSockets (ej. Socket.io, Firebase Realtime Database o Photon) para la sincronización de partidas en tiempo real.

Bases de datos para guardar perfiles de usuario, estadísticas (partidas ganadas/perdidas) y lista de amigos.

Módulo de Inteligencia Artificial (IA): Algoritmos básicos para los bots.

IA Fácil: Juega siempre la carta válida más baja que tenga.

IA Difícil: Guarda los 2 y los Ases para el final, sabe cuándo pasar para romper parejas de otros jugadores.

6. Variables y Ajustes Adicionales (Opciones para los usuarios)
Para que la app sea un éxito, debe permitir personalizar las reglas, ya que cada grupo de amigos juega diferente:

Igualar cartas: Opción de permitir que, si se tira un 5, el siguiente pueda tirar otro 5 (y que esto "salte" al siguiente jugador).

Cantidad de intercambio: Ajustar si el Presidente cambia 1, 2 o 3 cartas.

Revolución: Regla opcional donde si alguien tira 4 cartas iguales (ej. cuatro 7s), la jerarquía se invierte (el 3 pasa a ser el más alto y el As el más bajo) hasta el final de la ronda.