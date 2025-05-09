#include <WiFiNINA.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>
#include <ArduinoLowPower.h>

// DHT22
#define DHTPIN 2
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// BME280
Adafruit_BME280 bme;
bool bmeInitialized = false;

// LDR
#define LDR_PIN A0

// Wifi & MQTT
const char* ssid = ""; // insert your Wi-Fi ssid
const char* password = ""; // insert your Wi-Fi password
const char* mqtt_server = ""; // insert your MQTT server ip (Raspberry Pi ip)
WiFiClient wifiClient;
PubSubClient client(wifiClient);

void reconnect() {
  while (!client.connected()) {
    if (client.connect("ArduinoClient")) break;
    delay(5000);
  }
}

void setup() {
  unsigned long startTime = millis();

  dht.begin();
  WiFi.begin(ssid, password);
  unsigned long wifiStart = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - wifiStart < 15000) {
    delay(1000);
  }

  client.setServer(mqtt_server, 1883);
  reconnect();

  if (!bme.begin(0x76) && !bme.begin(0x77)) {
    bmeInitialized = false;
  } else {
    bmeInitialized = true;
  }

  // Read
  float dhtTemp = -999, dhtHum = -999;
  unsigned long dhtStart = millis();
  while (millis() - dhtStart < 2000) {
    float t = dht.readTemperature();
    float h = dht.readHumidity();
    if (!isnan(t)) dhtTemp = t;
    if (!isnan(h)) dhtHum = h;
  }

  float bmeTemp = bmeInitialized ? bme.readTemperature() : -999;
  float bmeHum  = bmeInitialized ? bme.readHumidity()  : -999;
  float bmePres = bmeInitialized ? bme.readPressure() / 100.0F : -999;
  int ldrValue  = analogRead(LDR_PIN);

  // Build payloads
  String dhtPayload = "{\"temperature\":" + String(dhtTemp, 2) +
                      ",\"humidity\":" + String(dhtHum, 2) + "}";

  String bmePayload = "{\"temperature\":" + String(bmeTemp, 2) +
                      ",\"humidity\":" + String(bmeHum, 2) +
                      ",\"pressure\":" + String(bmePres, 2) + "}";

  String ldrPayload = "{\"ldr\":" + String(ldrValue) + "}";

  // Publish to MQTT
  client.loop();
  delay(100);

  client.publish("sensors/dht22", dhtPayload.c_str());
  client.loop();
  delay(100);

  client.publish("sensors/bme280", bmePayload.c_str());
  client.loop();
  delay(100);

  client.publish("sensors/ldr", ldrPayload.c_str());
  client.loop();
  delay(100);

  delay(500);

  WiFi.disconnect();
  delay(100);
  WiFi.end(); 

  // Sleep interval
  unsigned long elapsed = millis() - startTime;
  unsigned long sleepDuration = max(0UL, 600000UL - elapsed);

  LowPower.deepSleep(sleepDuration);
  NVIC_SystemReset(); 
}

void loop() {
  //
}
