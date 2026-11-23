import { useEffect, useRef, useState, type ReactElement, type Ref } from "react";
import { View } from "react-native";
import {
  WebView as RNWebView,
  type WebViewMessageEvent,
  type WebViewProps,
} from "react-native-webview";

// react-native-webview@14 объявлен как `class WebView<P = undefined>`, из-за чего под
// @types/react 19 пропсы схлопываются в `WebViewProps & undefined` = never (любой проп →
// «not assignable to never»). Приводим тип ЭЛЕМЕНТА к нормальному FC; ref оставляем на
// реальном классе RNWebView — ради метода injectJavaScript.
const WebView = RNWebView as unknown as (
  props: WebViewProps & { ref?: Ref<RNWebView> },
) => ReactElement | null;

export interface MapPickerCoords {
  lat: number;
  lng: number;
}

/** HTML с Leaflet (CDN) + OSM. Маркер перетаскиваемый, клик ставит точку. */
function buildHtml(lat: number, lng: number): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>html,body,#map{height:100%;margin:0;padding:0;background:#e8eaed}</style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { attributionControl: false }).setView([${lat}, ${lng}], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    var marker = L.marker([${lat}, ${lng}], { draggable: true }).addTo(map);

    function send(ll) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ lat: ll.lat, lng: ll.lng }));
    }
    map.on('click', function (e) { marker.setLatLng(e.latlng); send(e.latlng); });
    marker.on('dragend', function () { send(marker.getLatLng()); });

    // приём recenter из RN (напр. «моё местоположение»)
    function onRnMessage(ev) {
      try {
        var d = JSON.parse(ev.data);
        if (d && d.type === 'recenter') {
          marker.setLatLng([d.lat, d.lng]);
          map.setView([d.lat, d.lng], map.getZoom());
        }
      } catch (e) {}
    }
    document.addEventListener('message', onRnMessage); // Android
    window.addEventListener('message', onRnMessage);   // iOS
  </script>
</body>
</html>`;
}

export function MapPicker({
  value,
  onChange,
  height = 280,
}: {
  value: MapPickerCoords;
  onChange: (c: MapPickerCoords) => void;
  height?: number;
}) {
  const ref = useRef<RNWebView>(null);
  // последняя точка, пришедшая ИЗ карты — чтобы не слать recenter в ответ на свой же клик
  const lastFromMap = useRef<MapPickerCoords | null>(null);
  // HTML собираем один раз (ленивый init useState — НЕ читаем ref во время рендера)
  const [html] = useState(() => buildHtml(value.lat, value.lng));

  function handleMessage(e: WebViewMessageEvent) {
    try {
      const d = JSON.parse(e.nativeEvent.data) as MapPickerCoords;
      lastFromMap.current = d;
      onChange(d);
    } catch {
      // игнорируем мусорные сообщения
    }
  }

  // Внешняя смена value (напр. геолокация) → двигаем карту. Собственные клики пропускаем.
  useEffect(() => {
    const m = lastFromMap.current;
    if (m && m.lat === value.lat && m.lng === value.lng) return;
    ref.current?.injectJavaScript(
      `onRnMessage({ data: JSON.stringify({ type: 'recenter', lat: ${value.lat}, lng: ${value.lng} }) }); true;`,
    );
  }, [value.lat, value.lng]);

  return (
    <View style={{ height, overflow: "hidden" }}>
      <WebView
        ref={ref}
        originWhitelist={["*"]}
        source={{ html }}
        onMessage={handleMessage}
        javaScriptEnabled
        scrollEnabled={false}
        // чтобы жесты карты не воровал внешний ScrollView на Android
        nestedScrollEnabled
        style={{ backgroundColor: "transparent" }}
      />
    </View>
  );
}
