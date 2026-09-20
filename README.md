# 10th Step App

Een rustig hulpmiddel voor dagelijkse zelfinventarisatie.

## Wat doet de app

De 10th Step App helpt je om elke dag even stil te staan bij jezelf. Je stelt je eigen vragen op — of gebruikt de standaardvragen — en vult die dagelijks in. Zo bouw je stap voor stap een persoonlijke geschiedenis op van hoe je dagen verliepen.

De app is geïnspireerd op de tiende stap uit 12-stappenprogramma's, maar is breder te gebruiken. Iedereen die dagelijks wil reflecteren op zichzelf kan ermee werken.

**Belangrijkste functies:**

- Dagelijkse check-in met je eigen vragen
- Vragen beheren: toevoegen, wijzigen, verbergen, herordenen
- Geschiedenis: terugkijken op eerdere dagen, precies zoals je ze invulde
- Automatisch opslaan terwijl je typt
- Licht/donker thema volgt je toestel

## Privacy

Deze app is ontworpen met privacy als uitgangspunt.

- **Alle data blijft op je toestel.** Er is geen server, geen account, geen cloud.
- **Geen tracking, geen analytics, geen advertenties.**
- **Geen internetverbinding nodig** om de app te gebruiken.
- Als je je browsergegevens wist of de app verwijdert, ben je je data kwijt. Er is geen backup.

Meer functionaliteit (zoals optionele backup of synchronisatie) staat op de verlanglijst, maar alleen als het de privacy niet aantast.

## Status

De app is in ontwikkeling. De kernfuncties werken en zijn bruikbaar. Er komen nog verbeteringen aan vormgeving, extra functies en uiteindelijk distributie via de appstores.

Wat werkt:
- Dagelijkse check-in
- Geschiedenis
- Vragen beheren
- Thema volgt toestel

Wat nog komt (geen belofte, geen planning):
- Optionele backup
- Notificaties
- Export

## Techniek

Gebouwd met:

- [Expo](https://expo.dev) (React Native)
- [Expo Router](https://docs.expo.dev/router/introduction/) voor navigatie
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) voor lokale opslag
- TypeScript

De webversie draait op GitHub Pages. Dezelfde codebase kan later ook naar iOS en Android.

## Lokaal draaien

Vereist: Node.js (versie 20 of hoger) en npm.

```bash
# Repository clonen
git clone https://github.com/dkooijman90-sudo/10thStepApp.git
cd 10thStepApp

# Dependencies installeren
npm install

# Starten
npx expo start
