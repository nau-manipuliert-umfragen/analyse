# Voting-Manipulation auf nau.ch - eine Analyse

> Manipuliert Nau die Abstimmungen?
> Softwareengenieur P.S. hat sich die Seite der NAU unter die Lupe genommen und ist zu folgendem Ergebnis gekommen. 
> Die Abstimmung zum Covid19 Gesetz auf Nau scheint hardgecoded zu sein. Das heisst, egal was abgestimmt wird, es zeigt sich ein von Nau definiertes Ergebnis, welches NAU nach Bedarf anpassen kann, denn es gibt weder Zähler noch ein Skript zur Auswertung.

Diesen Text habe ich gestern zugetragen bekommen.

Ursprünglich stammt er wahrscheinlich von https://www.facebook.com/coronarebellen

Ich habe mir deren Video angeschaut, und mein erster Gedanke war: doofes Missverständnis.

Für mich war klar, der Grund für die "hardgecodeden" Ergebnisse ist wohl eine Kombination aus Latenzoptimierung und Serverside-Rendering.

So ging ich davon aus, dass die Ergebnisse lediglich etwas veraltet sind (Ergebnisse werden beim Seitenaufruf bereits geladen, aber erst nachdem du abstimmst angezeigt. Das würde natürlich bedeuten dass der angezeigte Wert nicht 100% korrekt ist - denn deine Stimme würde erst für den nächsten Besucher berücksichtigt).


Zudem: wäre nau.ch wirklich so dumm keinen Request für’s voting einzubauen?

Also habe ich mir das ganze mal genauer angeschaut.

Die Aussage es gäbe kein Skript **stimmt nicht**. Wenn du auf eine Antwort klickst sendet dein Browser sehr wohl eine Anfrage - und der Server liefert die aktuellen Ergebnisse als Antwort.

Die Antwort vom Server sieht so aus:

![image](https://user-images.githubusercontent.com/85899008/122120996-65b1d180-ce2b-11eb-9fa2-2a855bf7d283.png)


Soweit scheint alles völlig legitim. Nun aber das Problem: **die Anzahl votes wird tatsächlich nicht aktualisiert!**

Das ist aber sicher auch nur eine Optimierung, oder? NEIN! Denn **bei anderen Abstimmungen ist das nicht so.**

Die Ursache ist schnell gefunden: **“end_at”**. Gewisse Abstimmungen sind zeitlich begrenzt - einen Fehler bekommt man aber nicht wenn sie abgelaufen sind.


Aha. Also ist die Umfrage schon abgelaufen? Ja. Aber nicht nur. **Die Umfrage war gar nie aktiv!** end_at ist kleiner als published_at - die Umfrage wurde also Veröffentlicht als sie bereits abgelaufen war.

Wurde das Ablaufdatum bei der Veröffentlichung in die Vergangenheit gesetzt, oder wurde einfach zu spät veröffentlicht? Schwer zu sagen.

Ist es also ein Fehler oder Manipulation von Seiten Nau.ch?


Um das rauszufinden habe ich ein Programm geschrieben, welches alle Umfragen von nau.ch analysiert.

Das Ergebnis:

**8379** Umfragen analysiert

**76** davon sind abgelaufen bevor sie veröffentlicht wurden

**66** von diesen hatten Antworten mit je 20 votes (nau.ch initialisiert die Antworten nicht mit 0, sondern mit 20 Votes - ist wohl psychologisch besser für die ersten Besucher eines Artikels). Diese wurden also nie verwendet.


Hier sind die Titel der restlichen **10**:

> Haben Sie WhatsApp von Ihrem Smartphone gelöscht?
> Haben Sie bereits mit Bitcoin etwas bezahlt?
> Was halten Sie von den geplanten Lockerungen des Bundesrats?
> Haben Sie sich bereits für die Corona-Impfung registriert?
> Werden Sie das CO2-Gesetz annehmen?
> Wollen Sie im AHV-Alter weiterarbeiten?
> Werden Sie das CO2-Gesetz annehmen?
> Sind Sie bereits geimpft?
> Werden Sie wieder öfter ins Restaurant gehen?
> Werden Sie das CO2-Gesetz annehmen?


Zum Vergleich: 10 mit random.org zufällig ausgewählte Nau.ch Umfragen:

> Wie gefällt Ihnen Beatrices Eglis osterliche Sonnenbrille?
> Gucken Sie «DSDS» auch ohne Wendler?
> Freuen Sie sich auf Annina Frey?
> Schafft es Marco Odermatt morgen zurück auf das Podest?
> Was halten Sie vom Sterbetourismus?
> Wie finden Sie den Sechs-Rennen-Plan der Formel E?
> Verstehen Sie, dass Charles lieber Zeit mit den Cambridge-Kindern verbringt?
> Ist es richtig, dass Urs Fischer bei Union bleibt?
> Cyberpunk 2077: Werden Sie dem Entwickler CD Projekt Red jemals verzeihen?
> Leiden Sie auch unter der Hitze?




Aufmerksamen Lesern ist jetzt sicher aufgefallen, **dass die COVID-Gesetz Abstimmung nicht in der Liste zu finden ist.**

Diese Abstimmung (**Antwort-IDs 22095 und 22096**, Umfragen-ID unbekannt) ist ein Spezialfall.

Aus über 22’000 Antwort-IDs sind diese 2 die EINZIGEN welche weder einen 404 Error (nicht gefunden) noch eine gültige Antwort zurückgeben.


Stattdessen kommt als Antwort einfach ein leeres Objekt “{}”.

Es lässt sich sogar beweisen dass das absichtlich ist, denn die Antwort kommt nicht vom normalen API-Server sondern direkt vom Loadbalancer/Reverse Proxy. Das sieht man daran dass bei ALLEN (gültigen, ungültigen und gelöschten) anderen Umfragen ein Set-Cookie Header gesetzt wird - ausser bei der COVID-Umfrage.


**Das lässt sich sogar ohne technisches Wissen leicht nachprüfen:**

Geht man auf eine beliebige Umfrage, z.b.

https://api.nau.ch/survey-answers/1/vote

Kommt ein Fehler der sagt dass nur Anfragen vom Typ POST unterstützt werden.

Wenn man beliebigen Text eingibt wie z.b.

https://api.nau.ch/dfdshkfjhjdnsaew

Kommt ein “Not Found” Fehler.

Einzig bei den IDs 22095 und 22096 kommt “{}”:

https://api.nau.ch/survey-answers/22095/vote

Hinten an die URL kann man beliebiges anhängen:

https://api.nau.ch/survey-answers/22095/vote12345678


**Denn**: nau.ch hat in der Hast das ganze zu vertuschen einen zu allgemeinen Filter eingebaut der nur den Anfang des Links überprüft.


Backup falls nau.ch die Manipulation als Reaktion auf diesen Bericht Rückgängig macht:

https://web.archive.org/web/20210614180354/https://api.nau.ch/survey-answers/22095/vote

https://web.archive.org/web/20210614180404/https://api.nau.ch/survey-answers/22096/vote



Und gerade für diese Abstimmung wurde nau.ch bereits auf Facebook und in ihren eigenen Kommentaren angeprangert. Ob die anderen 10 auch verschwinden, sobald sie das hier lesen? ;)


In diesem Repository sind alle Skripts zu finden die ich für die Analyse benutzt habe. An alle die ein Node Script ausführen können: **Überzeugt euch selbst**! Lasst den Scan selbst laufen, und teilt die Ergebnisse!
