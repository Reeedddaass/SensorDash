import paho.mqtt.client as mqtt
import pymysql
import json

# Database connection
db = pymysql.connect(
    host="localhost",
    user="", # insert your user name
    password="", # insert your password
    database="weather_base"
)
cursor = db.cursor()

# MQTT
MQTT_BROKER = "" # insert your MQTT server ip (Raspberry Pi ip)
MQTT_TOPICS = [("sensors/dht22", 0), ("sensors/bme280", 0), ("sensors/ldr", 0)]

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        client.subscribe(MQTT_TOPICS)
    else:
        print(f"Failed to connect. Return code: {rc}")

def on_message(client, userdata, msg):
    topic = msg.topic
    payload = msg.payload.decode()

    try:
        data = json.loads(payload)

        if topic == "sensors/dht22":
            sql = "INSERT INTO weather_data (temperature, humidity) VALUES (%s, %s)"
            cursor.execute(sql, (data["temperature"], data["humidity"]))

        elif topic == "sensors/bme280":
            sql = "INSERT INTO bme280_data (temperature, humidity, pressure) VALUES (%s, %s, %s)"
            cursor.execute(sql, (data["temperature"], data["humidity"], data["pressure"]))

        elif topic == "sensors/ldr":
            sql = "INSERT INTO ldr_data (light_level) VALUES (%s)"
            cursor.execute(sql, (data["ldr"],))

        db.commit()

    except (json.JSONDecodeError, pymysql.MySQLError) as e:
        print(f"Error: {e}")

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect(MQTT_BROKER, 1883, 60)
client.loop_forever()
