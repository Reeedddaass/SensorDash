# Naudoto kodo failai

Šiame aplanke pateikiami pagrindiniai programos komponentai, susiję su duomenų surinkimu, perdavimu ir saugojimu:

### `arduinoScript.ino`
Atsakingas už jutiklių nuskaitymą ir duomenų siuntimą per MQTT.

### `MQTT.py`
Python skriptas, veikiantis Raspberry Pi įrenginyje, kuris priima MQTT žinutes iš Arduino ir įrašo jas į MariaDB duomenų bazę.

### `init_db.sql`
SQL skriptas, naudojamas sukurti `weather_base` duomenų bazę ir reikalingas lenteles duomenų saugojimui.
